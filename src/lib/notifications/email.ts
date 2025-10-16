export type PasswordResetEmailOptions = {
  to: string;
  resetUrl: string;
  expiresInMinutes: number;
};

export async function sendPasswordResetEmail({ to, resetUrl, expiresInMinutes }: PasswordResetEmailOptions) {
  // Placeholder implementation. Hook up to real email provider here.
  console.info("[email] Password reset", {
    to,
    resetUrl,
    expiresInMinutes,
  });
}

