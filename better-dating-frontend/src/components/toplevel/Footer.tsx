import Link from "next/link";
import { Link as MuiLink } from "@material-ui/core";
import {
  toPage,
  acknowledgements,
  privacyPolicy,
  userAgreement,
} from "../navigation/NavigationUrls";
import * as Messages from "../Messages";

const Footer = () => (
  <footer className="c-footer u-padding-16px">
    <div className="u-text-align-center">
      {`© 2019 - ${new Date().getFullYear()} ${Messages.footer}`}{" "}
      <MuiLink
        href="https://github.com/skivol/better-dating/blob/master/LICENSE"
        target="_blank"
      >
        {Messages.license}
      </MuiLink>
      {", "}
    </div>
    <div className="u-text-align-center">
      <Link href={toPage(acknowledgements)} as={acknowledgements} passHref>
        <MuiLink>{Messages.acknowledgements}</MuiLink>
      </Link>
      {", "}
      <Link href={toPage(privacyPolicy)} as={privacyPolicy} passHref>
        <MuiLink>{Messages.privacyPolicy}</MuiLink>
      </Link>
      {", "}
      <Link href={toPage(userAgreement)} as={userAgreement} passHref>
        <MuiLink>{Messages.userAgreement}</MuiLink>
      </Link>
      {", "}
      <MuiLink href="https://stats.uptimerobot.com/g6Z9WSl8B1">
        {Messages.status}
      </MuiLink>
    </div>
  </footer>
);

export default Footer;
