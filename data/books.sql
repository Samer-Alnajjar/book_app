CREATE TABLE IF NOT EXISTS book(
    id SERIAL PRIMARY KEY NOT NULL ,
    author VARCHAR(265),
    title VARCHAR(265),
    image_url VARCHAR(265),
    description text
)