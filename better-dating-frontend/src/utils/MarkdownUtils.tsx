import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { Link as MuiLink } from "@material-ui/core";
import {
  userAgreement,
  privacyPolicy,
} from "../components/navigation/NavigationUrls";

const NextMuiLink = ({ children, href, ...rest }: any) =>
  [userAgreement, privacyPolicy].includes(href) ? (
    <Link href={href} {...rest} passHref>
      <MuiLink>{children}</MuiLink>
    </Link>
  ) : (
    <MuiLink {...{ children, href, ...rest }} />
  );
export const ReactMarkdownMaterialUi = ({ children, ...rest }: any) => (
  <ReactMarkdown components={{ a: NextMuiLink }} {...rest}>
    {children}
  </ReactMarkdown>
);
