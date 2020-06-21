<#macro body_generic>
    <body>
      <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <table class="email-content" width="100%" cellpadding="0" cellspacing="0">

              <#include "/common/logo.html">
              <!-- Email Body -->
              <tr>
                  <td class="email-body" width="100%">
                      <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0">
                          <!-- Body content -->
                          <tr>
                              <td class="content-cell">
                                  <#nested>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>

              <#include "/common/contact.html">

            </table>
          </td>
        </tr>
      </table>
    </body>
</#macro>

<#macro body>
    <@body_generic>
      <#nested>
      <#include "/common/action.html">
      <#include "/common/was-not-you.html">
      <#include "/common/action-fallback.html">
    </@body_generic>
</#macro>
