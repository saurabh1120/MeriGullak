package com.MeiGullak.SavingApp.service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendOtpEmail(
            String to, String name, String otp, String purpose
    ) {
        String subject = getOtpSubject(purpose);
        String html = buildOtpEmail(name, otp, purpose);
        sendHtmlEmail(to, subject, html);
    }

    @Async
    public void sendFriendRequestEmail(
            String to, String receiverName, String senderName
    ) {
        String subject = "🤝 " + senderName +
                " wants to be your friend on Meri Gullak";
        String html = buildFriendRequestEmail(
                receiverName, senderName);
        sendHtmlEmail(to, subject, html);
    }

    @Async
    public void sendGroupInviteEmail(
            String to, String memberName,
            String groupName, String inviterName
    ) {
        String subject = "👥 You've been added to " +
                groupName + " on Meri Gullak";
        String html = buildGroupInviteEmail(
                memberName, groupName, inviterName);
        sendHtmlEmail(to, subject, html);
    }

    @Async
    public void sendExpenseAddedEmail(
            String to, String memberName, String groupName,
            String expenseTitle, String amount, String paidBy
    ) {
        String subject = "💸 New expense added in " + groupName;
        String html = buildExpenseAddedEmail(
                memberName, groupName, expenseTitle, amount, paidBy);
        sendHtmlEmail(to, subject, html);
    }

    @Async
    public void sendSettlementEmail(
            String to, String receiverName,
            String payerName, String amount, String groupName
    ) {
        String subject = "✅ " + payerName +
                " settled ₹" + amount + " with you!";
        String html = buildSettlementEmail(
                receiverName, payerName, amount, groupName);
        sendHtmlEmail(to, subject, html);
    }

    @Async
    public void sendFriendAcceptedEmail(
            String to, String requesterName, String acceptorName
    ) {
        String subject = "🎉 " + acceptorName +
                " accepted your friend request!";
        String html = buildFriendAcceptedEmail(
                requesterName, acceptorName);
        sendHtmlEmail(to, subject, html);
    }

    private void sendHtmlEmail(
            String to, String subject, String html
    ) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            helper.setFrom("noreply@merigullak.com",
                    "Meri Gullak 🪙");
            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println(
                    "Failed to send email: " + e.getMessage());
        } catch (Exception e) {
            System.err.println(
                    "Email error: " + e.getMessage());
        }
    }

    private String getOtpSubject(String purpose) {
        return switch (purpose.toUpperCase()) {
            case "REGISTRATION" ->
                    "🪙 Verify your Meri Gullak account";
            case "PASSWORD_RESET" ->
                    "🔐 Reset your Meri Gullak password";
            default -> "🔑 Your Meri Gullak OTP";
        };
    }

    private String getBaseTemplate(String content) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport"
                content="width=device-width, initial-scale=1.0">
              <title>Meri Gullak</title>
            </head>
            <body style="margin:0;padding:0;background:#f0f2f5;
              font-family:'Helvetica Neue',Arial,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#f0f2f5;padding:40px 0;">
                <tr>
                  <td align="center">
                    <table width="560" cellpadding="0" cellspacing="0"
                      style="max-width:560px;width:100%;">

                      <!-- Header -->
                      <tr>
                        <td align="center" style="padding:0 0 24px;">
                          <div style="background:linear-gradient(135deg,#1a0533,#0d001f);
                            border-radius:20px 20px 0 0;padding:32px 40px;
                            text-align:center;">
                            <div style="font-size:48px;margin-bottom:8px;">🪙</div>
                            <h1 style="color:#ffffff;font-size:26px;
                              font-weight:800;margin:0;letter-spacing:-0.5px;">
                              <span style="color:#ffffff;">Meri </span>
                              <span style="color:#e8632a;">Gullak</span>
                            </h1>
                            <p style="color:#7a6e9a;font-size:13px;
                              margin:6px 0 0;letter-spacing:0.05em;">
                              SMART SAVINGS & EXPENSE TRACKER
                            </p>
                          </div>
                        </td>
                      </tr>

                      <!-- Content -->
                      <tr>
                        <td style="background:#ffffff;border-radius:0 0 20px 20px;
                          padding:36px 40px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                          """ + content + """

                          <!-- Footer -->
                          <div style="border-top:1px solid #f0f2f5;
                            margin-top:32px;padding-top:24px;text-align:center;">
                            <p style="color:#9896b0;font-size:12px;margin:0 0 4px;">
                              This email was sent by Meri Gullak
                            </p>
                            <p style="color:#9896b0;font-size:12px;margin:0;">
                              If you didn't request this, please ignore this email.
                            </p>
                            <p style="color:#c44b8a;font-size:13px;
                              font-weight:600;margin:12px 0 0;">
                              © 2026 Meri Gullak • All rights reserved
                            </p>
                          </div>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """;
    }

    private String buildOtpEmail(
            String name, String otp, String purpose
    ) {
        String purposeText = switch (purpose.toUpperCase()) {
            case "REGISTRATION" -> "verify your email address";
            case "PASSWORD_RESET" -> "reset your password";
            default -> "verify your identity";
        };

        String icon = purpose.equalsIgnoreCase("PASSWORD_RESET")
                ? "🔐" : "📧";

        String content = """
            <div style="text-align:center;margin-bottom:28px;">
              <div style="font-size:48px;margin-bottom:12px;">
              """ + icon + """
              </div>
              <h2 style="color:#1a1628;font-size:22px;font-weight:700;
                margin:0 0 8px;">
                Verify Your Identity
              </h2>
              <p style="color:#5a5570;font-size:14px;margin:0;
                line-height:1.6;">
                Hi <strong style="color:#1a1628;">""" + name + """
                </strong>! Use the OTP below to """ + purposeText + """
              </p>
            </div>

            <!-- OTP Box -->
            <div style="background:linear-gradient(135deg,
              rgba(196,75,138,0.08), rgba(232,99,42,0.06));
              border:2px solid rgba(196,75,138,0.2);
              border-radius:16px;padding:28px;text-align:center;
              margin:0 0 24px;">
              <p style="color:#5a5570;font-size:13px;
                margin:0 0 16px;font-weight:500;">
                Your One Time Password
              </p>
              <div style="display:inline-flex;gap:8px;">
            """ + buildOtpDigits(otp) + """
              </div>
              <p style="color:#c44b8a;font-size:13px;
                font-weight:600;margin:16px 0 0;">
                ⏰ Valid for 5 minutes only
              </p>
            </div>

            <!-- Warning -->
            <div style="background:#fff8f0;border:1px solid #f59e0b40;
              border-left:4px solid #f59e0b;border-radius:8px;
              padding:14px 16px;margin-bottom:24px;">
              <p style="color:#92400e;font-size:13px;margin:0;
                line-height:1.5;">
                🔒 <strong>Never share this OTP</strong> with anyone.
                Meri Gullak will never ask for your OTP.
              </p>
            </div>

            <p style="color:#9896b0;font-size:13px;
              text-align:center;margin:0;line-height:1.6;">
              If you didn't request this OTP, you can safely
              ignore this email.
            </p>
            """;

        return getBaseTemplate(content);
    }

    private String buildOtpDigits(String otp) {
        StringBuilder sb = new StringBuilder();
        for (char c : otp.toCharArray()) {
            sb.append("""
                <div style="width:44px;height:52px;
                  background:#1a0533;border-radius:10px;
                  display:inline-flex;align-items:center;
                  justify-content:center;font-size:24px;
                  font-weight:800;color:#c44b8a;
                  border:1.5px solid #c44b8a40;
                  line-height:52px;text-align:center;">
                """ + c + """
                </div>
                """);
        }
        return sb.toString();
    }

    private String buildFriendRequestEmail(
            String receiverName, String senderName
    ) {
        String content = """
            <div style="text-align:center;margin-bottom:28px;">
              <div style="font-size:48px;margin-bottom:12px;">🤝</div>
              <h2 style="color:#1a1628;font-size:22px;
                font-weight:700;margin:0 0 8px;">
                New Friend Request!
              </h2>
              <p style="color:#5a5570;font-size:14px;
                margin:0;line-height:1.6;">
                Hi <strong style="color:#1a1628;">"""
                + receiverName + """
                </strong>!
              </p>
            </div>

            <!-- Request Card -->
            <div style="background:linear-gradient(135deg,
              rgba(196,75,138,0.08), rgba(232,99,42,0.06));
              border:1px solid rgba(196,75,138,0.2);
              border-radius:16px;padding:24px;
              text-align:center;margin-bottom:24px;">
              <div style="width:60px;height:60px;border-radius:50%;
                background:linear-gradient(135deg,#c44b8a,#e8632a);
                margin:0 auto 12px;display:flex;align-items:center;
                justify-content:center;font-size:24px;
                font-weight:800;color:white;line-height:60px;">
                """ + senderName.charAt(0) + """
              </div>
              <h3 style="color:#1a1628;font-size:18px;
                font-weight:700;margin:0 0 4px;">
                """ + senderName + """
              </h3>
              <p style="color:#5a5570;font-size:13px;margin:0;">
                wants to be your friend on Meri Gullak
              </p>
            </div>

            <!-- Info -->
            <div style="background:#f8f9fc;border-radius:12px;
              padding:16px;margin-bottom:24px;text-align:center;">
              <p style="color:#5a5570;font-size:13px;
                margin:0;line-height:1.6;">
                Open the <strong style="color:#c44b8a;">
                Meri Gullak app</strong> to accept or
                reject this friend request.
              </p>
            </div>
            """;

        return getBaseTemplate(content);
    }

    private String buildGroupInviteEmail(
            String memberName, String groupName, String inviterName
    ) {
        String content = """
            <div style="text-align:center;margin-bottom:28px;">
              <div style="font-size:48px;margin-bottom:12px;">👥</div>
              <h2 style="color:#1a1628;font-size:22px;
                font-weight:700;margin:0 0 8px;">
                You've Been Added to a Group!
              </h2>
              <p style="color:#5a5570;font-size:14px;
                margin:0;line-height:1.6;">
                Hi <strong style="color:#1a1628;">"""
                + memberName + """
                </strong>!
              </p>
            </div>

            <!-- Group Card -->
            <div style="background:linear-gradient(135deg,
              rgba(124,58,237,0.08), rgba(196,75,138,0.06));
              border:1px solid rgba(124,58,237,0.2);
              border-radius:16px;padding:24px;
              text-align:center;margin-bottom:24px;">
              <div style="font-size:40px;margin-bottom:10px;">
                🏠
              </div>
              <h3 style="color:#1a1628;font-size:20px;
                font-weight:700;margin:0 0 6px;">
                """ + groupName + """
              </h3>
              <p style="color:#5a5570;font-size:13px;margin:0;">
                Added by
                <strong style="color:#7c3aed;">"""
                + inviterName + """
                </strong>
              </p>
            </div>

            <div style="background:#f8f9fc;border-radius:12px;
              padding:16px;margin-bottom:24px;text-align:center;">
              <p style="color:#5a5570;font-size:13px;
                margin:0;line-height:1.6;">
                You can now see and add expenses in this group.
                Open <strong style="color:#c44b8a;">
                Meri Gullak</strong> to get started!
              </p>
            </div>
            """;

        return getBaseTemplate(content);
    }

    private String buildExpenseAddedEmail(
            String memberName, String groupName,
            String expenseTitle, String amount, String paidBy
    ) {
        String content = """
            <div style="text-align:center;margin-bottom:28px;">
              <div style="font-size:48px;margin-bottom:12px;">💸</div>
              <h2 style="color:#1a1628;font-size:22px;
                font-weight:700;margin:0 0 8px;">
                New Expense Added!
              </h2>
              <p style="color:#5a5570;font-size:14px;
                margin:0;line-height:1.6;">
                Hi <strong style="color:#1a1628;">"""
                + memberName + """
                </strong>!
              </p>
            </div>

            <!-- Expense Card -->
            <div style="background:linear-gradient(135deg,
              rgba(232,99,42,0.08), rgba(196,75,138,0.06));
              border:1px solid rgba(232,99,42,0.2);
              border-radius:16px;padding:24px;margin-bottom:24px;">
              <div style="display:flex;justify-content:space-between;
                align-items:center;margin-bottom:16px;">
                <div>
                  <p style="color:#5a5570;font-size:12px;
                    margin:0 0 4px;font-weight:500;">
                    GROUP
                  </p>
                  <h3 style="color:#1a1628;font-size:16px;
                    font-weight:700;margin:0;">
                    """ + groupName + """
                  </h3>
                </div>
                <div style="text-align:right;">
                  <p style="color:#5a5570;font-size:12px;
                    margin:0 0 4px;font-weight:500;">
                    AMOUNT
                  </p>
                  <h3 style="color:#e8632a;font-size:22px;
                    font-weight:800;margin:0;">
                    ₹""" + amount + """
                  </h3>
                </div>
              </div>
              <div style="background:white;border-radius:10px;
                padding:14px;border:1px solid rgba(0,0,0,0.06);">
                <p style="color:#5a5570;font-size:12px;
                  margin:0 0 4px;">
                  EXPENSE
                </p>
                <p style="color:#1a1628;font-size:15px;
                  font-weight:600;margin:0 0 8px;">
                  """ + expenseTitle + """
                </p>
                <p style="color:#5a5570;font-size:13px;margin:0;">
                  Paid by
                  <strong style="color:#c44b8a;">"""
                + paidBy + """
                  </strong>
                </p>
              </div>
            </div>

            <div style="background:#f8f9fc;border-radius:12px;
              padding:16px;text-align:center;">
              <p style="color:#5a5570;font-size:13px;
                margin:0;line-height:1.6;">
                Open <strong style="color:#c44b8a;">Meri Gullak
                </strong> to see your share and settle up.
              </p>
            </div>
            """;

        return getBaseTemplate(content);
    }

    private String buildSettlementEmail(
            String receiverName, String payerName,
            String amount, String groupName
    ) {
        String content = """
            <div style="text-align:center;margin-bottom:28px;">
              <div style="font-size:48px;margin-bottom:12px;">✅</div>
              <h2 style="color:#1a1628;font-size:22px;
                font-weight:700;margin:0 0 8px;">
                Payment Settled!
              </h2>
              <p style="color:#5a5570;font-size:14px;
                margin:0;line-height:1.6;">
                Hi <strong style="color:#1a1628;">"""
                + receiverName + """
                </strong>!
              </p>
            </div>

            <!-- Settlement Card -->
            <div style="background:linear-gradient(135deg,
              rgba(62,207,142,0.1), rgba(22,163,74,0.06));
              border:1px solid rgba(62,207,142,0.3);
              border-radius:16px;padding:28px;
              text-align:center;margin-bottom:24px;">
              <p style="color:#5a5570;font-size:14px;margin:0 0 8px;">
                <strong style="color:#1a1628;">"""
                + payerName + """
                </strong> has settled
              </p>
              <h2 style="color:#16a34a;font-size:36px;
                font-weight:800;margin:8px 0;">
                ₹""" + amount + """
              </h2>
              <p style="color:#5a5570;font-size:13px;margin:0;">
                in <strong style="color:#1a1628;">"""
                + groupName + """
                </strong>
              </p>
            </div>

            <div style="background:#f0fdf4;
              border:1px solid #86efac;border-radius:12px;
              padding:16px;text-align:center;margin-bottom:24px;">
              <p style="color:#166534;font-size:13px;
                margin:0;line-height:1.6;font-weight:500;">
                🎉 You're all settled up with """ + payerName + """
              </p>
            </div>
            """;

        return getBaseTemplate(content);
    }

    private String buildFriendAcceptedEmail(
            String requesterName, String acceptorName
    ) {
        String content = """
            <div style="text-align:center;margin-bottom:28px;">
              <div style="font-size:48px;margin-bottom:12px;">🎉</div>
              <h2 style="color:#1a1628;font-size:22px;
                font-weight:700;margin:0 0 8px;">
                Friend Request Accepted!
              </h2>
              <p style="color:#5a5570;font-size:14px;
                margin:0;line-height:1.6;">
                Hi <strong style="color:#1a1628;">"""
                + requesterName + """
                </strong>!
              </p>
            </div>

            <!-- Accepted Card -->
            <div style="background:linear-gradient(135deg,
              rgba(196,75,138,0.08), rgba(232,99,42,0.06));
              border:1px solid rgba(196,75,138,0.2);
              border-radius:16px;padding:24px;
              text-align:center;margin-bottom:24px;">
              <div style="width:60px;height:60px;border-radius:50%;
                background:linear-gradient(135deg,#3ecf8e,#16a34a);
                margin:0 auto 12px;line-height:60px;
                font-size:28px;text-align:center;">
                ✅
              </div>
              <h3 style="color:#1a1628;font-size:18px;
                font-weight:700;margin:0 0 4px;">
                """ + acceptorName + """
              </h3>
              <p style="color:#5a5570;font-size:13px;margin:0;">
                accepted your friend request!
              </p>
            </div>

            <div style="background:#f8f9fc;border-radius:12px;
              padding:16px;text-align:center;margin-bottom:24px;">
              <p style="color:#5a5570;font-size:13px;
                margin:0;line-height:1.6;">
                You can now create groups and split expenses with
                <strong style="color:#c44b8a;">"""
                + acceptorName + """
                </strong> on Meri Gullak!
              </p>
            </div>
            """;

        return getBaseTemplate(content);
    }
}