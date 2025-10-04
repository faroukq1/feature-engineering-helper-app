import { z } from "zod";

export const registerSchema = z
  .object({
    firstName: z.string().min(4, { message: "Must be at least 4 characters" }),
    lastName: z.string().min(4, { message: "Must be at least 4 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]+$/,
        {
          message:
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)",
        }
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Export the inferred type for TypeScript
export type RegisterFormData = z.infer<typeof registerSchema>;
