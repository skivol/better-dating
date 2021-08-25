CREATE TABLE history (
	id serial NOT NULL,
	profile_id uuid NOT NULL,
	"type" varchar NOT NULL,
	"timestamp" timestamptz NOT NULL,
	payload json NOT NULL,
	CONSTRAINT history_pk PRIMARY KEY (id),
	CONSTRAINT history_fk FOREIGN KEY (profile_id) REFERENCES email(id)
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
