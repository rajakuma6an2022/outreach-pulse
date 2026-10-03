import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateCadenceMutation } from "../../services/cadenceApi";
import { getErrorMessage } from "../../utils/errors";

const MAX_STEPS = 3;

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  steps: z
    .array(
      z.object({
        subject: z.string().min(1, "Subject is required").max(200),
        body: z.string().min(1, "Body is required").max(5000),
        delayMinutes: z
          .number()
          .int("Must be a whole number")
          .min(0, "Min 0")
          .max(43200, "Max 43200 (30 days)"),
      })
    )
    .min(1)
    .max(MAX_STEPS),
});

type FormValues = z.infer<typeof schema>;

const emptyStep = { subject: "", body: "", delayMinutes: 0 };

export default function CadenceForm() {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", steps: [emptyStep] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "steps" });
  const [createCadence, { isLoading, error }] = useCreateCadenceMutation();

  const onSubmit = async (values: FormValues) => {
    try {
      await createCadence({
        name: values.name,
        steps: values.steps.map((s, i) => ({ ...s, order: i + 1 })),
      }).unwrap();
      reset({ name: "", steps: [emptyStep] });
    } catch {
      // error UI la kaattrom
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2>Create cadence</h2>
      {error && <div className="alert">{getErrorMessage(error)}</div>}

      <div className="field">
        <label htmlFor="c-name">Cadence name *</label>
        <input id="c-name" placeholder="e.g. Cold outreach v1" {...register("name")} />
        {errors.name && <span className="err">{errors.name.message}</span>}
      </div>

      {fields.map((field, index) => (
        <div className="step-box" key={field.id}>
          <div className="step-head">
            <strong>Step {index + 1}</strong>
            {fields.length > 1 && (
              <button type="button" className="btn danger" onClick={() => remove(index)}>
                Remove
              </button>
            )}
          </div>

          <div className="field">
            <label>Subject *</label>
            <input placeholder="Hi {{name}}" {...register(`steps.${index}.subject`)} />
            {errors.steps?.[index]?.subject && (
              <span className="err">{errors.steps[index]?.subject?.message}</span>
            )}
          </div>

          <div className="field">
            <label>Body *</label>
            <textarea
              rows={3}
              placeholder="Write the email body..."
              {...register(`steps.${index}.body`)}
            />
            {errors.steps?.[index]?.body && (
              <span className="err">{errors.steps[index]?.body?.message}</span>
            )}
          </div>

          <div className="field" style={{ maxWidth: 220 }}>
            <label>Delay (minutes) before sending</label>
            <input
              type="number"
              min={0}
              {...register(`steps.${index}.delayMinutes`, { valueAsNumber: true })}
            />
            {errors.steps?.[index]?.delayMinutes && (
              <span className="err">{errors.steps[index]?.delayMinutes?.message}</span>
            )}
          </div>
        </div>
      ))}

      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <button
          type="button"
          className="btn ghost"
          disabled={fields.length >= MAX_STEPS}
          onClick={() => append(emptyStep)}
        >
          + Add step ({fields.length}/{MAX_STEPS})
        </button>
        <button className="btn" type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create cadence"}
        </button>
      </div>
    </form>
  );
}