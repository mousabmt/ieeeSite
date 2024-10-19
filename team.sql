create table if not exists users(
    user_ID serial primary key,
    user_name varchar(50),
    user_pic varchar(255),
    user_committee varchar(30),
    user_email VARCHAR(255) CHECK (user_email ~ '^[^@]+@[^@]+\.[^@]+$')
);

create table if not exists emailRecords(
    email_ID SERIAL PRIMARY KEY,
    messageContent text,
    messageDateTime TIMESTAMP,
    committee varchar(30)
);