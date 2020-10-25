import { Grid, Paper, Typography, Divider, Link } from "@material-ui/core";
import Header from "./toplevel/Header";
import {
  libraries as frontendLibraries,
  tools as frontendTools,
} from "./acknowledgements/frontend";
import {
  libraries as serverLibraries,
  tools as serverTools,
  infrastructure as serverInfrastructure,
} from "./acknowledgements/backend";
import { devEnvironment } from "./acknowledgements/dev-environment";
import { Licenses } from "./acknowledgements/licenses";
import * as Messages from "./acknowledgements/Messages";
// @ts-ignore
import mitLicenseText from "./acknowledgements/licenses/MIT License.txt";
// @ts-ignore
import apacheLicenseText from "./acknowledgements/licenses/Apache License 2.0.txt";
// @ts-ignore
import postgresCopyrightText from "./acknowledgements/licenses/Postgres Copyright.txt";
// @ts-ignore
import eclipseLicenseText from "./acknowledgements/licenses/Eclipse Public License - v 2.0.txt";
// @ts-ignore
import bsd3LicenseText from "./acknowledgements/licenses/BSD-3-Clause.txt";
// @ts-ignore
import nginxLicenseText from "./acknowledgements/licenses/Nginx License.txt";

const licenseId = (license: string) => license.replace(" ", "_");
type LicenseProps = {
  license: string;
  text: string;
};
const License = ({ license, text }: LicenseProps) => (
  <Paper
    id={licenseId(license)}
    elevation={3}
    className="u-padding-16px u-center-horizontally u-margin-bottom-10px u-max-height u-overflow-y-auto"
  >
    <Typography>{license}</Typography>
    <Divider className="u-margin-top-bottom-10px" />
    <pre style={{ whiteSpace: "pre-wrap" }}>{text}</pre>
  </Paper>
);

type AcknowledgementEntryProps = {
  name: string;
  url: string;
  license: any;
  copyright: any;
};
const AcknowledgementEntry = ({
  name,
  url,
  license,
  copyright,
}: AcknowledgementEntryProps) => {
  const licenses = Array.isArray(license || []) ? license : [license];
  const copyrights = Array.isArray(copyright || []) ? copyright : [copyright];
  return (
    <li>
      <Link href={url}>{name}</Link>
      {licenses && ", "}
      {licenses &&
        licenses
          .map((l: any) => (l.url ? l : { url: `#${licenseId(l)}`, name: l }))
          .map((l: any) => (
            <Link className="u-right-margin-10px" key={l.name} href={l.url}>
              {l.name}
            </Link>
          ))}
      {copyrights &&
        copyrights.map((c: any) => <Typography key={c}>{c}</Typography>)}
    </li>
  );
};

const AcknowledgementEntries = ({ entries }: any) => (
  <ul>
    {entries
      .sort((a: any, b: any) => (a.name > b.name ? 1 : -1))
      .map((library: any) => (
        <AcknowledgementEntry key={library.name} {...library} />
      ))}
  </ul>
);

const Acknowledgements = () => {
  return (
    <>
      <Header />
      <Grid
        container
        direction="column"
        className="u-margin-top-bottom-15px u-min-width-300px u-padding-10px"
      >
        <Paper elevation={3} className="u-padding-15px">
          <Typography variant="h2">{Messages.acknowledgements}</Typography>
          <Divider className="u-margin-top-bottom-10px" />

          <Typography variant="h4">{Messages.clientApplication}</Typography>
          <Typography variant="h6">{Messages.libraries}</Typography>
          <AcknowledgementEntries entries={frontendLibraries} />

          <Typography variant="h6">{Messages.tools}</Typography>
          <AcknowledgementEntries entries={frontendTools} />

          <Typography variant="h4">{Messages.serverApplication}</Typography>
          <Typography variant="h6">{Messages.libraries}</Typography>
          <AcknowledgementEntries entries={serverLibraries} />

          <Typography variant="h6">{Messages.tools}</Typography>
          <AcknowledgementEntries entries={serverTools} />

          <Typography variant="h4">{Messages.infrastructure}</Typography>
          <AcknowledgementEntries entries={serverInfrastructure} />

          <Typography variant="h4">{Messages.devEnvironment}</Typography>
          <AcknowledgementEntries entries={devEnvironment} />

          <Typography className="u-margin-bottom-10px" variant="h4">
            {Messages.licensesText}
          </Typography>
          <License license={Licenses.MIT} text={mitLicenseText} />
          <License license={Licenses.APACHE} text={apacheLicenseText} />
          <License license={Licenses.POSTGRES} text={postgresCopyrightText} />
          <License license={Licenses.ECLIPSE} text={eclipseLicenseText} />
          <License license={Licenses.BSD_3} text={bsd3LicenseText} />
          <License license={Licenses.NGINX} text={nginxLicenseText} />
        </Paper>
      </Grid>
    </>
  );
};

// TODO acknowledge information sources

export default Acknowledgements;
