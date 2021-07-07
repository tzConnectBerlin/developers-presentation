import * as React from "react";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import { Formik, Form, Field } from "formik";
import { Button, Grid, TextField } from "@material-ui/core";
import { useWallet } from "@tz-contrib/react-wallet-provider";
import { vote } from "./contract";
import { useToasts } from "react-toast-notifications";

export default function VoteCard() {
  const { connected } = useWallet();
  const { addToast } = useToasts();
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
          initialValues={{ pollId: "", pollOption: 0 }}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue, errors, touched }) => (
            <Form>
              <Grid direction="column" container spacing={3}>
                <Grid item>
                  <Field
                    component={TextField}
                    name="pollId"
                    type="text"
                    label="Poll ID"
                    fullWidth
                    onChange={(e: any) => {
                      setFieldValue("pollId", e.target.value);
                    }}
                    error={touched.pollId && Boolean(errors.pollId)}
                    helperText={touched.pollId ? errors.pollId : ""}
                  />
                </Grid>
                <Grid item>
                  <Field
                    component={TextField}
                    name="pollOption"
                    type="number"
                    label="Number of options"
                    fullWidth
                    onChange={(e: any) => {
                      setFieldValue("pollOption", e.target.value);
                    }}
                    error={touched.pollOption && Boolean(errors.pollOption)}
                    helperText={touched.pollOption ? errors.pollOption : ""}
                  />
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    fullWidth
                    type="submit"
                    disabled={!connected}
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
