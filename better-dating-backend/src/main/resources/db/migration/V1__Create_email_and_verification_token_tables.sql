-- Email

CREATE TABLE email (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    verified boolean NOT NULL
);

ALTER TABLE email
    ADD CONSTRAINT email_pkey PRIMARY KEY (id);

ALTER TABLE email
    ADD CONSTRAINT email_uk_email UNIQUE (email);

-- Email verification token

CREATE TABLE email_verification_token (
    id uuid NOT NULL,
    expires timestamp without time zone,
    email_id uuid
);

ALTER TABLE email_verification_token
    ADD CONSTRAINT email_verification_token_pkey PRIMARY KEY (id);

ALTER TABLE email_verification_token
    ADD CONSTRAINT email_verification_token_fk_email_id FOREIGN KEY (email_id) REFERENCES email(id);
