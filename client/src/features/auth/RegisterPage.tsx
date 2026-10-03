import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { useRegisterMutation } from "../../services/authApi";
import { getErrorMessage } from "../../utils/errors";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  workspaceName: z.string().min(2, "Workspace name must be at least 2 characters").max(100),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const [registerUser, { isLoading, error }] = useRegisterMutation();

  const onSubmit = async (values: FormValues) => {
    try {
      await registerUser(values).unwrap();
    } catch {
      // error UI la kaattrom
    }
  };

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={handleSubmit(onSubmit)} noValidate>
        <h1>Create your workspace</h1>
        <p className="sub">You will be the ADMIN of this workspace</p>

        {error && <div className="alert">{getErrorMessage(error)}</div>}

        <div className="field">
          <label htmlFor="name">Your name</label>
          <input id="name" autoComplete="name" {...register("name")} />
          {errors.name && <span className="err">{errors.name.message}</span>}
        </div>

        <div className="field">
          <label htmlFor="workspaceName">Company / workspace name</label>
          <input id="workspaceName" {...register("workspaceName")} />
          {errors.workspaceName && <span className="err">{errors.workspaceName.message}</span>}
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" {...register("email")} />
          {errors.email && <span className="err">{errors.email.message}</span>}
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
          />
          {errors.password && <span className="err">{errors.password.message}</span>}
        </div>

        <button className="btn block" type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create account"}
        </button>

        <p className="sub" style={{ marginTop: 16, textAlign: "center" }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}