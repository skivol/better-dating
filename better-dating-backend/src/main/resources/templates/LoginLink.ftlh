<#import "/common/parts.ftlh" as common>
<#-- https://github.com/usecanvas/email-templates/blob/master/templates/verify-email.html -->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <#include "/common/head.ftlh">
    <@common.body>
        <h1>${title}</h1>
        <p>${message}</p>
    </@common.body>
</html>
