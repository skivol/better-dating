CREATE TABLE login_information (
	profile_id uuid NOT NULL,
	last_host varchar NOT NULL,
	CONSTRAINT login_information_pk PRIMARY KEY (profile_id),
	CONSTRAINT login_information_fk FOREIGN KEY (profile_id) REFERENCES email(id)
);

CREATE TABLE dating_pair (
	id uuid NOT NULL,
	first_profile_id uuid NOT NULL,
	second_profile_id uuid NOT NULL,
	goal varchar(64) NOT NULL,
	when_matched timestamp(0) NOT NULL,
	active bool NOT NULL,
	first_profile_snapshot json NOT NULL,
	second_profile_snapshot json NOT NULL,
	CONSTRAINT dating_pair_pk PRIMARY KEY (id)
);

CREATE TABLE dating_pair_lock (
    profile_id uuid NOT NULL,
    CONSTRAINT dating_pair_lock_pk PRIMARY KEY (profile_id),
    CONSTRAINT dating_pair_lock_fk FOREIGN KEY (profile_id) REFERENCES email (id)
);

CREATE TABLE place (
	id uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	location GEOGRAPHY(POINT,4326) NOT NULL,
	populated_locality_id uuid NOT NULL,
	suggested_by uuid NULL,
	approved_by uuid NULL,
	status varchar(20) NOT NULL,

	CONSTRAINT place_pk PRIMARY KEY (id),
	CONSTRAINT place_fk FOREIGN KEY (populated_locality_id) REFERENCES populated_locality(id),
	CONSTRAINT place_suggested_by_fk FOREIGN KEY (suggested_by) REFERENCES email(id)
);
CREATE INDEX place_populated_locality_id_idx ON place USING btree (populated_locality_id);

CREATE TABLE timeslot (
	day_of_week int4 NOT NULL,
	time_of_day time(0) NOT NULL,
	CONSTRAINT timeslot_pk PRIMARY KEY (time_of_day, day_of_week)
);

INSERT INTO timeslot (day_of_week, time_of_day)
VALUES (6, '11:00:00'),
        (6, '11:15:00'),
        (6, '11:30:00'),
        (6, '11:45:00'),
        (6, '12:00:00'),
        (7, '11:00:00'),
        (7, '11:15:00'),
        (7, '11:30:00'),
        (7, '11:45:00'),
        (7, '12:00:00');

CREATE TABLE dates (
	id uuid NOT NULL,
	pair_id uuid NOT NULL,
	status varchar NOT NULL,
	place_id uuid NULL,
	location GEOGRAPHY(POINT,4326) NULL,
	when_scheduled timestamptz(0) NULL,
	CONSTRAINT dates_pk PRIMARY KEY (id),
	CONSTRAINT dates_fk FOREIGN KEY (pair_id) REFERENCES dating_pair(id),
	CONSTRAINT dates_place_fk FOREIGN KEY (place_id) REFERENCES place(id),
	CONSTRAINT dates_un UNIQUE (place_id, when_scheduled)
);

CREATE TABLE date_check_in (
	date_id uuid NOT NULL,
	profile_id uuid NOT NULL,
	when_checked_in timestamptz(0) NOT NULL,
	CONSTRAINT date_check_in_pk PRIMARY KEY (profile_id,date_id),
	CONSTRAINT date_check_in_fk FOREIGN KEY (profile_id) REFERENCES profile_info(profile_id),
	CONSTRAINT date_check_in_fk_1 FOREIGN KEY (date_id) REFERENCES dates(id)
);

CREATE TABLE date_verification_token_data (
	token_id uuid NOT NULL,
	date_id uuid NOT NULL,
	CONSTRAINT date_verification_token_data_pk PRIMARY KEY (token_id),
	CONSTRAINT date_verification_token_data_fk FOREIGN KEY (token_id) REFERENCES expiring_token(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT date_verification_token_data_fk_1 FOREIGN KEY (date_id) REFERENCES dates(id)
);
