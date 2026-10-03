import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { useLoginMutation } from "../../services/authApi";
import { getErrorMessage } from "../../utils/errors";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const [login, { isLoading, error }] = useLoginMutation();

  const onSubmit = async (values: FormValues) => {
    try {
      await login(values).unwrap();
      // success: authSlice update aagum, PublicOnlyRoute dashboard ku anuppum
    } catch {
      // error state-la irukku, UI la kaattrom
    }
  };

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={handleSubmit(onSubmit)} noValidate>
        <h1>Welcome back</h1>
        <p className="sub">Login to OutreachPulse</p>

        {error && <div className="alert">{getErrorMessage(error)}</div>}

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
            autoComplete="current-password"
            {...register("password")}
          />
          {errors.password && <span className="err">{errors.password.message}</span>}
        </div>

        <button className="btn block" type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>

        <p className="sub" style={{ marginTop: 16, textAlign: "center" }}>
          New here? <Link to="/register">Create a workspace</Link>
        </p>
      </form>
    </div>
  );
}