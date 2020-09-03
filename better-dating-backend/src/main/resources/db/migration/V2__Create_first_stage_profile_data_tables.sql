-- First stage profile information tables

CREATE TABLE accepted_terms (
	profile_id uuid NOT NULL,
	last_date_accepted timestamp NOT NULL,
	CONSTRAINT accepted_terms_profile_id_pk PRIMARY KEY (profile_id),
	CONSTRAINT accepted_terms__profile_id_fk FOREIGN KEY (profile_id) REFERENCES email(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE profile_info (
	profile_id uuid NOT NULL,
	gender varchar(6) NOT NULL,
	birthday date NOT NULL,
	created_at timestamp NOT NULL,
	updated_at timestamp NULL,
	CONSTRAINT profile_info_profile_id_pk PRIMARY KEY (profile_id),
	CONSTRAINT profile_info_fk FOREIGN KEY (profile_id) REFERENCES email(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE height (
	profile_id uuid NOT NULL,
	"date" timestamp NOT NULL,
	height numeric(5,2) NOT NULL,
	CONSTRAINT height__profile_id_date_pk PRIMARY KEY (profile_id, date),
	CONSTRAINT height__profile_id_fk FOREIGN KEY (profile_id) REFERENCES email(id) ON UPDATE CASCADE ON DELETE RESTRICT
);
COMMENT ON COLUMN height.height IS 'Height in centimeters';

CREATE TABLE weight (
	profile_id uuid NOT NULL,
	"date" timestamp NOT NULL,
	weight numeric(6,3) NOT NULL,
	CONSTRAINT weight__profile_id_date_pk PRIMARY KEY (profile_id, date),
	CONSTRAINT weight_fk FOREIGN KEY (profile_id) REFERENCES email(id) ON UPDATE CASCADE ON DELETE RESTRICT
);
COMMENT ON COLUMN weight.weight IS 'Weight in kilograms';

CREATE TABLE activity (
	profile_id uuid NOT NULL,
	"name" varchar(50) NOT NULL,
	"date" timestamp NOT NULL,
	recurrence varchar(50) NOT NULL,
	CONSTRAINT activity_pk PRIMARY KEY (profile_id,"name","date"),
	CONSTRAINT activity_fk FOREIGN KEY (profile_id) REFERENCES email(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE profile_evaluation (
	source_profile_id uuid NOT NULL,
	target_profile_id uuid NOT NULL,
	"date" timestamp NOT NULL,
	evaluation numeric(2) NOT NULL,
	"comment" varchar NULL,
	CONSTRAINT profile_evaluation__pk PRIMARY KEY (source_profile_id,target_profile_id,"date"),
	CONSTRAINT profile_evaluation__source_profile_id_fk FOREIGN KEY (source_profile_id) REFERENCES email(id) ON DELETE RESTRICT ON UPDATE CASCADE,
	CONSTRAINT profile_evaluation__target_profile_id_fk FOREIGN KEY (target_profile_id) REFERENCES email(id) ON DELETE RESTRICT ON UPDATE CASCADE
);
COMMENT ON COLUMN profile_evaluation."comment" IS 'Positive and/or negative remark on the evaluation motivation';
COMMENT ON COLUMN profile_evaluation.source_profile_id IS 'User who evaluates';
COMMENT ON COLUMN profile_evaluation.target_profile_id IS 'Profile which is evaluated';
COMMENT ON COLUMN profile_evaluation."date" IS 'Date of evaluation';
COMMENT ON COLUMN profile_evaluation.evaluation IS '1 to 10 evaluation mark';

-- Track email changes in profiles for possible (possession issues) troubleshooting

CREATE TABLE email_change_history (
	id SERIAL PRIMARY KEY,
	profile_id uuid NOT NULL,
	email varchar NOT NULL,
	changed_on timestamp NOT NULL
);

CREATE FUNCTION save_email_change_history()
	RETURNS TRIGGER
AS $$
BEGIN
	IF NEW.email <> OLD.email THEN
		INSERT INTO email_change_history (profile_id, email, changed_on) VALUES (OLD.id, OLD.email, now());
	END IF;
	RETURN NULL;
END;
$$ LANGUAGE PLPGSQL;

CREATE TRIGGER save_email_change_history_trigger
	AFTER UPDATE of email
	ON email FOR EACH ROW
	EXECUTE PROCEDURE save_email_change_history();

-- Email verification + one time passwords / account removal / view other user profile etc tokens support
CREATE TABLE expiring_token (
	id uuid NOT NULL,
	profile_id uuid NOT NULL,
	encoded_value varchar(255) NOT NULL,
	expires timestamp without time zone NOT NULL,
	type varchar(30) NOT NULL,
	CONSTRAINT expiring_token_pk PRIMARY KEY (id),
	CONSTRAINT expiring_token_fk FOREIGN KEY (profile_id) REFERENCES email(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Use more secure email verification token (see expiring_token)
DROP TABLE email_verification_token;

-- View other user extra token data
CREATE TABLE view_other_user_profile_token_data (
	token_id uuid NOT NULL,
	target_profile_id uuid NOT NULL,
	CONSTRAINT view_other_user_profile_token_data_pk PRIMARY KEY (token_id),
	CONSTRAINT view_other_user_profile_token_data__token_id_fk FOREIGN KEY (token_id) REFERENCES expiring_token(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT view_other_user_profile_token_data__target_profile_id_fk FOREIGN KEY (target_profile_id) REFERENCES email(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Track who and when viewed whose profile
CREATE TABLE profile_view_history (
	viewer_profile_id uuid NOT NULL,
	target_profile_id uuid NOT NULL,
	date timestamp without time zone NOT NULL,
	CONSTRAINT profile_view_history_pk PRIMARY KEY (viewer_profile_id, target_profile_id, date)
);

-- Feedback when removing account
CREATE TABLE profile_deletion_feedback (
	profile_id uuid NOT NULL,
	reason varchar(30) NOT NULL,
	explanation_comment varchar(255) NOT NULL
);

-- Introduce user roles
CREATE TABLE user_role (
	profile_id uuid NOT NULL,
	role varchar(30) NOT NULL,
	CONSTRAINT user_role_pk PRIMARY KEY (profile_id, role),
	CONSTRAINT user_role_fk FOREIGN KEY (profile_id) REFERENCES email(id) ON DELETE CASCADE ON UPDATE CASCADE
);
