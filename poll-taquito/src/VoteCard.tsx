import * as React from "react";
import * as Yup from "yup";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import { Formik, Form, Field } from "formik";
import { Button, Grid } from "@material-ui/core";
import { useWallet } from "@tz-contrib/react-wallet-provider";
import { vote } from "./contract";
import { useToasts } from "react-toast-notifications";
import { FormikTextField } from "./FormikTextField";

export default function VoteCard() {
  const { connected } = useWallet();
  const { addToast } = useToasts();
  const validationSchema = Yup.object().shape({
    pollId: Yup.string().required("Required"),
    pollOption: Yup.number().min(1, "Min value is 1").required("Required"),
  });
  const handleSubmit = async (values: any, helper: any) => {
    if (connected) {
      try {
        const hash = await vote(values.pollId, values.pollOption);
        if (hash) {
          addToast("Tx Submitted", {
            appearance: "success",
            autoDismiss: true,
          });
          helper.resetForm();
        }
      } catch (error) {
        console.log(error);
        const errorMessage = error?.data[1]?.with?.string || "Tx Failed";
        addToast(errorMessage, {
          appearance: "error",
          autoDismiss: true,
        });
      }
    }
  };
  return (
    <Card sx={{ maxWidth: "21.5rem" }}>
      <CardHeader title="Cast your Vote" subheader="Cast your vote here" />
      <CardContent>
        <Formik
          initialValues={{ pollId: "", pollOption: 1 }}
          onSubmit={handleSubmit}
          validationSchema={validationSchema}
          validateOnChange
          validateOnBlur
        >
          {({ setFieldValue, errors, touched, isValid, dirty }) => (
            <Form>
              <Grid direction="column" container spacing={3}>
                <Grid item>
                  <Field
                    component={FormikTextField}
                    name="pollId"
                    type="text"
                    label="Poll ID"
                    fullWidth
                  />
                </Grid>
                <Grid item>
                  <Field
                    component={FormikTextField}
                    name="pollOption"
                    type="number"
                    label="Number of options"
                    fullWidth
                  />
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    fullWidth
                    type="submit"
                    disabled={!connected || !isValid || !dirty}
                  >
                    Submit
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
}
