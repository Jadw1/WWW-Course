import { Meme } from "./meme";
import * as db from 'sqlite3';
import { exit } from "process";
import * as bcrypt from 'bcrypt';

export const databaseFile = 'database.sqlite';

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

export interface PriceHistory{
    price: number;
    by_who: string;
}

const dbConnection = new db.Database(databaseFile, (error: Error) => {
    if(error) {
        console.error('Connection to databas not established.');
        exit(1);
    }
});

async function doRunDB(database: db.Database, sql: string, args?: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
        database.run(sql, args, (err: Error) => {
            if(err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

async function doAllDB(database: db.Database, sql: string, args?: any[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
        database.all(sql, args, (err: Error, data: any[]) => {
            if(err) {
                reject(err);
                return;
            }
            resolve(data);
        });
    });
}

async function doGetDB(database: db.Database, sql: string, args?: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
        database.get(sql, args, (err: Error, data: any) => {
            if(err) {
                reject(err);
                return;
            }
            resolve(data);
        });
    });
}

async function doExecDB(database: db.Database, sql: string): Promise<void> {
    return new Promise((resolve, reject) => {
        database.exec(sql, (err: Error) => {
            if(err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

export function addMeme(meme: Meme): Promise<void> {
    const sql = `
        INSERT INTO meme (id, title, url)
        VALUES (?, ?, ?);
    `;
    return doRunDB(dbConnection, sql, [meme.id, meme.name, meme.url]);
}

export function addMemePrice(memeID: number, price: number, who: string): Promise<void> {
    const sql = `
        BEGIN EXCLUSIVE;
        INSERT OR ROLLBACK INTO meme_price (meme_id, value, by_who)
        VALUES (${memeID}, ${price}, "${who}");
        COMMIT;
    `;
    return doExecDB(dbConnection,sql);
}

export function getAllMemes(): Promise<MemeInfo[]> {
    const sql = `
        SELECT id, title, url, value as price
        FROM meme
        LEFT JOIN (
            SELECT meme_id, value, max(id)
            FROM meme_price
            GROUP BY meme_id
        )
        ON id = meme_id;
    `;
    return doAllDB(dbConnection, sql);
}

export function getBestN(n: number = 3): Promise<MemeInfo[]> {
    const sql = `
        SELECT id, title, url, value as price
        FROM meme
        LEFT JOIN (
            SELECT meme_id, value, max(id)
            FROM meme_price
            GROUP BY meme_id
        )
        ON id = meme_id
        ORDER BY price DESC
        LIMIT ?;
    `;
    return doAllDB(dbConnection, sql, [n]);
}

export function getMemePriceHistory(memeID: number): Promise<PriceHistory[]> {
    const sql = `
        SELECT value AS price, by_who
        FROM meme_price
        WHERE meme_id = ?
        ORDER BY id DESC;
    `;
    return doAllDB(dbConnection, sql, [memeID]);
}

export function getMeme(memeID: number): Promise<MemeInfo> {
    const sql = `
        SELECT id, title, url, value as price
        FROM meme
        LEFT JOIN (
            SELECT meme_id, value, max(id)
            FROM meme_price
            GROUP BY meme_id
        )
        ON id = meme_id
        WHERE id = ?;
    `;
    return doGetDB(dbConnection, sql, [memeID]);
}

export async function dropTables(): Promise<void> {
    const sql = `
        DROP TABLE IF EXISTS meme_price;
        DROP TABLE IF EXISTS meme;
        DROP TABLE IF EXISTS user;
    `;
    return doExecDB(dbConnection, sql);
}

export async function createTables(): Promise<void> {
    const sql = `
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
            by_who      TEXT NOT NULL,
            FOREIGN KEY(meme_id) REFERENCES meme(id)
        );
        CREATE TABLE user (
            username    TEXT PRIMARY KEY,
            pass_hash   TEXT NOT NULL
        );
    `;
    return doExecDB(dbConnection, sql);
}

const saltRounds = 10;
export async function addUser(username: string, password: string): Promise<void> {
    const sql = `
        INSERT INTO user (username, pass_hash)
        VALUES (?, ?);
    `;

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

                dbConnection.run(sql, [username, hash], (error: Error) => {
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
    const sql = `
        SELECT username AS name, pass_hash AS password_hash
        FROM user
        WHERE name = ?
    `;

    return new Promise((resolve, reject) => {
        dbConnection.get(sql, [username], (error: Error, user: User) => {
            if(error) {
                reject(error);
                return;
            }

            if(user === undefined) {
                reject(Error('User not found.'));
                return;
            }

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