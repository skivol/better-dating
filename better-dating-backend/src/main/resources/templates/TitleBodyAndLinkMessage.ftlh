<#import "/common/parts.ftlh" as common>
<#-- https://github.com/usecanvas/email-templates/blob/master/templates/verify-email.html -->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <#include "/common/head.ftlh">
    <@common.body>
        <h1>${title}</h1>
        <#-- https://freemarker.apache.org/docs/dgui_misc_autoescaping.html#dgui_misc_autoescaping_disableautoesc -->
        <p>${body?no_esc}</p>
    </@common.body>
</html>
