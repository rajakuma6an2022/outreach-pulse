import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateProspectMutation } from "../../services/prospectApi";
import { getErrorMessage } from "../../utils/errors";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Enter a valid email"),
  company: z.string().max(100),
  title: z.string().max(100),
});

type FormValues = z.infer<typeof schema>;

export default function ProspectForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", company: "", title: "" },
  });

  const [createProspect, { isLoading, error }] = useCreateProspectMutation();

  const onSubmit = async (values: FormValues) => {
    try {
      await createProspect(values).unwrap();
      reset();
    } catch {
      // error UI la kaattrom (duplicate email na 409 message varum)
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2>Add prospect</h2>
      {error && <div className="alert">{getErrorMessage(error)}</div>}

      <div className="grid-form">
        <div className="field">
          <label htmlFor="p-name">Name *</label>
          <input id="p-name" {...register("name")} />
          {errors.name && <span className="err">{errors.name.message}</span>}
        </div>

        <div className="field">
          <label htmlFor="p-email">Email *</label>
          <input id="p-email" type="email" {...register("email")} />
          {errors.email && <span className="err">{errors.email.message}</span>}
        </div>

        <div className="field">
          <label htmlFor="p-company">Company</label>
          <input id="p-company" {...register("company")} />
          {errors.company && <span className="err">{errors.company.message}</span>}
        </div>

        <div className="field">
          <label htmlFor="p-title">Title</label>
          <input id="p-title" {...register("title")} />
          {errors.title && <span className="err">{errors.title.message}</span>}
        </div>
      </div>

      <button className="btn" type="submit" disabled={isLoading}>
        {isLoading ? "Adding..." : "Add prospect"}
      </button>
    </form>
  );
}