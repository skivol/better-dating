package ua.betterdating.backend

import java.time.LocalDateTime
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.Id
import javax.persistence.OneToOne
import javax.persistence.Column
import javax.validation.constraints.NotNull

// https://stackoverflow.com/questions/45086957/how-to-generate-an-auto-uuid-using-hibernate-on-spring-boot
// TODO add @CreatedDate ( https://springbootdev.com/2018/03/13/spring-data-jpa-auditing-with-createdby-createddate-lastmodifiedby-and-lastmodifieddate/ )
// Unique column: https://stackoverflow.com/questions/3126769/uniqueconstraint-annotation-in-java
@Entity
class Email(
	@Column(unique = true, nullable = false) var email: String,
	var verified: Boolean,
	@Id @GeneratedValue var id: UUID? = null
)

@Entity
class EmailVerificationToken(
	@OneToOne @NotNull var email: Email,
	var expires: LocalDateTime,
	@Id @GeneratedValue var id: UUID? = null
)
