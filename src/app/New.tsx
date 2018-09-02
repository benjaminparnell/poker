import * as React from "react";
import * as autobind from "auto-bind";
import {
  Form,
  Formik,
  Field,
  FieldArray,
  ArrayHelpers,
  FormikProps
} from "formik";
import { withRouter, RouteComponentProps } from "react-router-dom";
import * as yup from "yup";

type Story = {
  name: string;
  url?: string;
};

type FormValues = {
  name: string;
  stories: Story[];
};

const validationSchema = yup.object<FormValues>().shape({
  name: yup.string().required(),
  stories: yup.array().of(
    yup.object<Story>().shape({
      name: yup.string().required(),
      url: yup.string().url()
    })
  )
});

interface Props extends RouteComponentProps<any> {}

class New extends React.Component<Props> {
  constructor(props: any) {
    super(props);
    autobind.react(this);
  }

  onSubmit(values: FormValues) {
    console.log(values);
    this.props.history.push("/");
  }

  render() {
    return (
      <div>
        <h2>Create a new session</h2>

        <Formik
          initialValues={{ name: "", stories: [] }}
          onSubmit={this.onSubmit}
          validationSchema={validationSchema}
          render={({ values, isValid }: FormikProps<FormValues>) => (
            <Form>
              <div>
                <label htmlFor="name">Name</label>
                <Field name="name" />
              </div>

              <div>
                <label htmlFor="stories">Stories</label>
                <FieldArray
                  name="stories"
                  render={(arrayHelpers: ArrayHelpers) => (
                    <div>
                      {values.stories &&
                        values.stories.map((_, index) => (
                          <div key={index}>
                            <Field
                              name={`stories.${index}.name`}
                              placeholder="Name"
                            />
                            <Field
                              name={`stories.${index}.url`}
                              placeholder="URL"
                            />

                            <button
                              type="button"
                              onClick={() => arrayHelpers.remove(index)}
                            >
                              Remove
                            </button>
                          </div>
                        ))}

                      <button
                        type="button"
                        onClick={() => arrayHelpers.push({ name: "", url: "" })}
                      >
                        Add Story
                      </button>
                    </div>
                  )}
                />
              </div>

              <button type="submit" disabled={!isValid}>
                Create
              </button>
            </Form>
          )}
        />
      </div>
    );
  }
}

export default withRouter(New);
