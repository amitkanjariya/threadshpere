import z from "zod";

export const userValidation = z.object({
    image: z.string().url().nonempty(),
    name: z.string().min(3, {message: "Minimum 3 characters."}).max(30, {message: "Maximum 30 Characters are allowed."}),
    username: z.string().min(3, {message: "Minimum 3 characters."}).max(20, {message: "Maximum 20 Characters are allowed."}),
    bio: z.string().min(3, {message: "Minimum 3 characters."}).max(1000, {message: "Maximum 1000 Characters are allowed."}),
})