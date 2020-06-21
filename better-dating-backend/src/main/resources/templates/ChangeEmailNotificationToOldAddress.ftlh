<#import "/common/parts.ftlh" as common>
<#-- https://github.com/usecanvas/email-templates/blob/master/templates/verify-email.html -->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <#include "/common/head.ftlh">
    <@common.body_generic>
        <h1>${title}</h1>
        <p>Вы недавно поменяли почтовый адрес в профиле на сайте "смотрины.укр & смотрины.рус".</p>
        <p>Если это были Вы, то можете проигнорировать это письмо.</p>
        <p><b>Если это были не Вы,</b> то напишите письмо <a href="mailto:${contactUs}">${contactUs}</a>.</p>
        <p>С уважением,<br>"смотрины.укр & смотрины.рус"</p>
    </@common.body_generic>
</html>
