1. Make login work only using keys for usual (admin) and root users correspondingly;
	* ssh-copy-id (https://www.ssh.com/ssh/copy-id)
	* [How to disable ssh password login](https://www.cyberciti.biz/faq/how-to-disable-ssh-password-login-on-linux/) (except for "UsePAM no" and "PermitRootLogin no"; "sudo systemctl reload sshd")
	* [root ssh access](https://unix.stackexchange.com/a/92397) ("PermitRootLogin without-password")
	* Extra: https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys-on-centos7
	* https://stackoverflow.com/questions/50735833/what-is-the-difference-between-chmod-go-rwx-and-chmod-700
	* cat ~/.ssh/id_rsa.pub | ssh $USER@$PROD "mkdir -p ~/.ssh && touch ~/.ssh/authorized_keys && chmod -R go= ~/.ssh && cat >> ~/.ssh/authorized_keys"
2. [Install Docker](https://docs.docker.com/engine/install/centos/);
	* [ensure "ftype" filesystem option is set to 1](https://docs.docker.com/storage/storagedriver/overlayfs-driver/)
	* [Post install](https://docs.docker.com/engine/install/linux-postinstall/)
		** Manage Docker as a non-root user;
		** Configure Docker to start on boot;
		** Configure the default logging driver
3. Configure Docker:
	* [Docker daemon config](https://docs.docker.com/config/daemon/) (/etc/docker/daemon.json - { "storage-driver": "overlay2" })
4. Install zsh/git + oh-my-zsh (nvim, bzip2)
5. Configure Let's Encrypt (or copy backup); install certbot;
	* https://community.letsencrypt.org/t/move-to-another-server/77985/5
6. Copy over scripts/aliases/password files/.env/prepare dhparam and configure docker secrets;
7. Transfer docker images;
8. (disable crontab tasks; stop containers) Migrate docker volumes;
	* [Backup & Restore Docker Named Volumes](https://medium.com/@loomchild/backup-restore-docker-named-volumes-350397b8e362)
9. Run application and see if it runs;
	* docker swarm init
	* docker stack deploy ...
10. Re-target domain(s) IP(s);
12. Verify it works ;)
13. Update scripts variables (ideally in external file);
14. Configure cron jobs (update paths to scripts).
	*/10 * * * * /home/admin/bd/status-check.sh > /dev/null 2>&1
	5,20,35,50 * * * * flock -n -e /home/admin/cron.docker.lock /home/admin/bd/troubleshooting.sh > /dev/null 2>&1
	@reboot echo "$(date -u) - System start up" >> /home/admin/reboot.log
	0 0 1 2,4,6,8,10,12 * flock -e /home/admin/cron.docker.lock /home/admin/bd/certificate-update.sh > /dev/null 2>&1
15. Remove images / volumes / files / configurations (certificates / ssh).