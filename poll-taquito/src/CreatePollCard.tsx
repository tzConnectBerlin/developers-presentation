import * as React from "react";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import DatePicker from "@material-ui/lab/DatePicker";
import { Formik, Form, Field } from "formik";
import { Button, Grid, TextField } from "@material-ui/core";
import { useWallet } from "@tz-contrib/react-wallet-provider";
import { createPoll } from "./contract";
import { useToasts } from "react-toast-notifications";
import { FormikTextField } from "./FormikTextField";

export default function CreatePollCard() {
  const { connected } = useWallet();
  const { addToast } = useToasts();
  const handleSubmit = async (values: any, helper: any) => {
    if (connected) {
      try {
        const hash = await createPoll(
          values.pollId,
          values.endDate,
          values.noOfOptions
        );
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
      <CardHeader title="Create A Poll" subheader="Start a new poll" />
      <CardContent>
        <Formik
          initialValues={{ pollId: "", endDate: new Date(), noOfOptions: 2 }}
          onSubmit={handleSubmit}
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
                    label="End Date"
                    name="endDate"
                    component={DatePicker}
                    onChange={(value: any) => {
                      setFieldValue("endDate", value);
                    }}
                    renderInput={(params: any) => (
                      <TextField {...params} fullWidth />
                    )}
                    error={touched.endDate && Boolean(errors.endDate)}
                    helperText={touched.endDate ? errors.endDate : ""}
                    disablePast
                  />
                </Grid>
                <Grid item>
                  <Field
                    component={FormikTextField}
                    name="noOfOptions"
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
