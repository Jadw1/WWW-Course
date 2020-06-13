import { Meme } from "./meme";
import * as db from 'sqlite3';
import { exit } from "process";
import * as bcrypt from 'bcrypt';

export const database_file = 'database.sqlite';

export interface MemeInfo {
    id: number;
    title: string;
    url: string;
    price: number;
}

export interface User {
    name: string;
    password_hash: string;
}

const db_connection = new db.Database(database_file, (error: Error) => {
    if(error) {
        console.error('Connection to databas not established.');
        exit(1);
    }
});

export function addMeme(meme: Meme): Promise<void> {
    return new Promise((resolve, reject) => {
        db_connection.run(` insert into meme (id, title, url)
                            values (${meme.id}, "${meme.name}", "${meme.url}");`,
        (error: Error) => {
            if(error) {
                reject(error);
                return;
            }
            resolve();
        });
    });
}

export function addMemePrice(memeID: number, price: number): Promise<void> {
    return new Promise((resolve, reject) => {
        db_connection.run(` insert into meme_price (meme_id, value, time_stamp)
                            values (${memeID}, ${price}, ${Date.now()});`,
        (error: Error) => {
            if(error) {
                reject(error);
                return;
            }
            resolve();
        });
    });
}

export function getAllMemes(): Promise<MemeInfo[]> {
    return new Promise((resolve, reject) => {
        db_connection.all(` select id, title, url, value as price from meme
                            left join (
                            select meme_id, value, max(time_stamp)
                            from meme_price
                            group by meme_id)
                            on id = meme_id;`,
            (error: Error, data: MemeInfo[]) => {
                if(error) {
                    reject(error);
                    return;
                }
                resolve(data);
            });
    });
}

export function getBestN(n: number = 3): Promise<MemeInfo[]> {
    return new Promise((resolve, reject) => {
        db_connection.all(` select id, title, url, value as price from meme
                            left join (
                            select meme_id, value, max(time_stamp)
                            from meme_price
                            group by meme_id)
                            on id = meme_id
                            order by price desc
                            limit ${n};`,
            (error: Error, data: MemeInfo[]) => {
                if(error) {
                    reject(error);
                    return;
                }
                resolve(data);
            });
    });
}

export function getMemePriceHistory(memeID: number): Promise<number[]> {
    return new Promise((resolve, reject) => {
        db_connection.all(` select value as price
                            from meme_price
                            where meme_id = ${memeID}
                            order by time_stamp desc;`,
            (error: Error, data) => {
                if(error) {
                    reject(error);
                    return;
                }
                resolve(data.map(p => p.price));
            });
    });
}

export function getMeme(memeID: number): Promise<MemeInfo> {
    return new Promise((resolve, reject) => {
        db_connection.all(` select id, title, url, value as price from meme
                            left join (
                            select meme_id, value, max(time_stamp)
                            from meme_price
                            group by meme_id)
                            on id = meme_id
                            where id = ${memeID};`,
            (error: Error, data) => {
                if(error) {
                    reject(error);
                    return;
                }
                resolve(data[0]);
            });
    });
}

const saltRounds = 10;
export async function addUser(username: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(saltRounds, (err: Error, salt: string) => {
            if(err) {
                reject(err);
                return;
            }

            bcrypt.hash(password, salt, (hashErr: Error, hash: string) => {
                if(hashErr) {
                    reject(hashErr);
                    return;
                }

                db_connection.run(`
                INSERT INTO user (username, pass_hash)
                VALUES (?, ?);`,
                [username, hash], (error: Error) => {
                    if(error) {
                        reject(error);
                        return;
                    }
                    resolve();
                });
            });
        });
    });
}

export async function authUser(username: string, password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        db_connection.all(` select username as name, pass_hash as password_hash
                            from user
                            where name = ?`,
                            [username], (error: Error, result: User[]) => {
                                if(error) {
                                    reject(error);
                                    return;
                                }

                                const user = result[0];
                                bcrypt.compare(password, user.password_hash, (err: Error, res: boolean) => {
                                    if(err) {
                                        reject(err);
                                        return;
                                    }

                                    resolve(res);
                                });
                            });
    });
}

export async function dropTables() {
    const command = new Promise((resolve, reject) => {
        db_connection.exec(`
        DROP TABLE IF EXISTS meme_price;
        DROP TABLE IF EXISTS meme;
        DROP TABLE IF EXISTS user`,
            (error: Error) => {
                if(error) {
                    reject(error);
                    return;
                }
                resolve();
            });
    });

    await command;
}

export async function createTables() {
    const command = new Promise((resolve, reject) => {
        db_connection.exec(`
        CREATE TABLE meme (
            id	        INTEGER NOT NULL,
            title	    TEXT NOT NULL,
            url	        TEXT NOT NULL,
            PRIMARY KEY(id)
        );
        CREATE TABLE meme_price (
            id	        INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            meme_id	    INTEGER NOT NULL,
            value	    INTEGER NOT NULL,
            time_stamp	INTEGER NOT NULL,
            FOREIGN KEY(meme_id) REFERENCES meme(id)
        );
        CREATE TABLE user (
            username    TEXT PRIMARY KEY,
            pass_hash   TEXT NOT NULL
        );`,
        (error: Error) => {
            if(error) {
                reject(error);
                return;
            }
            resolve();
        });
    });

    await command;
}