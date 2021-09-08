CREATE TABLE history (
	id serial NOT NULL,
	profile_id uuid NOT NULL,
	"type" varchar NOT NULL,
	"timestamp" timestamptz NOT NULL,
	payload json NOT NULL,
	CONSTRAINT history_pk PRIMARY KEY (id)
);
CREATE INDEX history_type_idx ON history (profile_id,"type");

-- migrate profile_view_history
INSERT INTO history (profile_id, type, "timestamp", payload)
SELECT target_profile_id, 'ProfileViewedByOtherUser', "date", ('{"viewer_profile_id": "' || viewer_profile_id || '"}')::json
FROM profile_view_history;

DROP TABLE profile_view_history;

-- migrate email_change_history
INSERT INTO history (profile_id, type, "timestamp", payload)
SELECT profile_id, 'EmailChanged', "changed_on", ('{"old_email": "' || email || '"}')::json
FROM email_change_history;

DROP TRIGGER save_email_change_history_trigger ON email;
DROP FUNCTION save_email_change_history;
DROP TABLE email_change_history;

-- migrate profile_deletion_feedback
UPDATE profile_deletion_feedback SET reason = upper(substr(reason, 1, 1)) || substr(reason, 2);
INSERT INTO history (profile_id, type, "timestamp", payload)
SELECT profile_id, 'ProfileRemoved', now(), ('{"reason": "' || reason || '", "explanation_comment": "' || explanation_comment || '"}')::json
FROM profile_deletion_feedback;

DROP TABLE profile_deletion_feedback;

-- switch to timestamps with timezone

ALTER TABLE expiring_token ALTER COLUMN expires TYPE timestamptz USING expires::timestamptz;
ALTER TABLE accepted_terms ALTER COLUMN last_date_accepted TYPE timestamptz USING last_date_accepted::timestamptz;

ALTER TABLE profile_info ALTER COLUMN created_at TYPE timestamptz USING created_at::timestamptz;
ALTER TABLE profile_info ALTER COLUMN updated_at TYPE timestamptz USING updated_at::timestamptz;

ALTER TABLE height ALTER COLUMN date TYPE timestamptz USING date::timestamptz;
ALTER TABLE weight ALTER COLUMN date TYPE timestamptz USING date::timestamptz;

ALTER TABLE activity ALTER COLUMN date TYPE timestamptz USING date::timestamptz;
ALTER TABLE profile_evaluation ALTER COLUMN date TYPE timestamptz USING date::timestamptz;

-- adjust to kotlin enum naming convention
UPDATE activity SET name = upper(substr(name, 1, 1)) || substr(name, 2), recurrence = upper(substr(recurrence, 1, 1)) || substr(recurrence, 2);
UPDATE profile_info SET gender = upper(substr(gender, 1, 1)) || substr(gender, 2);
