import { Paper } from "@material-ui/core";
import Header from "../toplevel/Header";
import fullTextOfUserAgreement from "./UserAgreement.md";
import { ReactMarkdownMaterialUi } from "../../utils";

export const UserAgreementPage = () => (
  <>
    <Header />
    <Paper elevation={3} className="u-padding-15px">
      <ReactMarkdownMaterialUi>
        {fullTextOfUserAgreement}
      </ReactMarkdownMaterialUi>
    </Paper>
  </>
);
