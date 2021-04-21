# Server access (SSH)
1. Make login work only using keys for usual (admin) and root users correspondingly;
	* ssh-copy-id (https://www.ssh.com/ssh/copy-id)
	* [How to disable ssh password login](https://www.cyberciti.biz/faq/how-to-disable-ssh-password-login-on-linux/) (except for "UsePAM no" and "PermitRootLogin no"; "sudo systemctl reload sshd")
	* [root ssh access](https://unix.stackexchange.com/a/92397) ("PermitRootLogin without-password")
	* Extra: https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys-on-centos7
	* https://stackoverflow.com/questions/50735833/what-is-the-difference-between-chmod-go-rwx-and-chmod-700
	* cat ~/.ssh/id_rsa.pub | ssh $USER@$PROD "mkdir -p ~/.ssh && touch ~/.ssh/authorized_keys && chmod -R go= ~/.ssh && cat >> ~/.ssh/authorized_keys"

# Encryption (LUKS)
0. Install dependencies (https://wiki.centos.org/HowTos/EncryptedFilesystem#Required_Packages);
1. Refer to https://launchbylunch.com/posts/2014/Jan/13/encrypting-docker-on-digitalocean/ and https://wiki.centos.org/HowTos/EncryptedFilesystem for how-to create encrypted file system and configure its mount on boot;
	* luks2 (https://www.cyberciti.biz/security/howto-linux-hard-disk-encryption-with-luks-cryptsetup-command/)
2. Ensure proper (simplest) console is used (so that client, for example, "remote-viewer" supports it) and the password prompt would work:
	* sudo vi /etc/sysconfig/grub # cleanup things like "console=ttyS0,115200", leave only "console=tty0"
	* sudo grub2-mkconfig -o /etc/grub2.cfg # regenerate grub config https://www.golinuxcloud.com/encrypt-root-partition-boot-swap-luks-linux/
	* sudo dracut -f
	* [CentOS7 GRUB2](https://www.thegeekdiary.com/centos-rhel-7-grub2-configuration-file-bootgrub2grub-cfg-explained/)
3. [How to add a passphrase, key, or keyfile to an existing LUKS device](https://access.redhat.com/solutions/230993);
4. Secure: /home, /etc/letsencrypt, /var/lib/docker. Note:
	* use "rsync -aP" https://www.guguweb.com/2019/02/07/how-to-move-docker-data-directory-to-another-location-on-ubuntu/ to avoid issues below;
	* copy with hidden/dot files;
	* keep SELinux context, especially for ".ssh" folder; ("chcon" to the resque if object type becomes wrong)
4.1 [Securely erase files and folders on CentOS 7](https://www.netweaver.uk/securely-erase-files-folders-centos-7/)

# Docker
2. [Install Docker](https://docs.docker.com/engine/install/centos/);
	* [ensure "ftype" filesystem option is set to 1](https://docs.docker.com/storage/storagedriver/overlayfs-driver/)
	* [Post install](https://docs.docker.com/engine/install/linux-postinstall/)
		** Manage Docker as a non-root user;
		** Configure Docker to start on boot (`sudo systemctl enable --now docker`);
		** Configure the default logging driver
3. Configure Docker:
	* [Docker daemon config](https://docs.docker.com/config/daemon/) (/etc/docker/daemon.json - { "storage-driver": "overlay2" })

# Shell
4. Install zsh/git + oh-my-zsh (nvim, bzip2)

# Let's Encrypt certificates
5. Configure Let's Encrypt (or copy backup); install certbot;
	* https://community.letsencrypt.org/t/move-to-another-server/77985/5

# Scripts / Secrets
6. Copy over scripts/aliases/password files/.env/prepare dhparam and configure docker secrets;

# Docker images / volumes / swarm
7. Transfer docker images;
8. (disable crontab tasks; stop containers) Migrate docker volumes;
	* [Backup & Restore Docker Named Volumes](https://medium.com/@loomchild/backup-restore-docker-named-volumes-350397b8e362)
9. Run application and see if it runs;
	* docker swarm init
	* docker stack deploy ...

# Domain names
10. Re-target domain(s) IP(s);
12. Verify it works ;)

# Periodic tasks (cron)
13. Configure cron jobs (update paths to scripts).
	*/10 * * * * /home/admin/bd/status-check.sh > /dev/null 2>&1
	5,20,35,50 * * * * flock -n -e /home/admin/cron.docker.lock /home/admin/bd/troubleshooting.sh > /dev/null 2>&1
	@reboot echo "$(date -u) - System start up" >> /home/admin/reboot.log
	0 0 1 2,4,6,8,10,12 * flock -e /home/admin/cron.docker.lock /home/admin/bd/certificate-update.sh > /dev/null 2>&1

# Clean up (if migrating)
14. Remove images / volumes / files / configurations (certificates / ssh).

# Email alerts
0. Use [UptimeRobot](https://uptimerobot.com) for now...
1. Consider shutdown service which sends email alert:
	* [How To Send E-Mail Alerts on a CentOS VPS for System Monitoring](https://www.digitalocean.com/community/tutorials/how-to-send-e-mail-alerts-on-a-centos-vps-for-system-monitoring);
	* [Sending Alert Email on Linux Server Shutdown or Reboot](https://unix.stackexchange.com/questions/477446/sending-alert-email-on-linux-server-shutdown-or-reboot);
	* Maybe someday:
		* [Postfix HOWTO](https://wiki.centos.org/HowTos/postfix);
		* [How To use an SPF Record to Prevent Spoofing & Improve E-mail Reliability](https://www.digitalocean.com/community/tutorials/how-to-use-an-spf-record-to-prevent-spoofing-improve-e-mail-reliability);
    