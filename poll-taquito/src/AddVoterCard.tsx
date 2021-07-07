import * as React from "react";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import { Formik, Form, Field } from "formik";
import { Button, Grid, TextField } from "@material-ui/core";
import { useWallet } from "@tz-contrib/react-wallet-provider";
import { addVoter } from "./contract";
import { useToasts } from "react-toast-notifications";

export default function AddVoterCard() {
  const { connected } = useWallet();
  const { addToast } = useToasts();
  const handleSubmit = async (values: any, helper: any) => {
    if (connected) {
      try {
        const hash = await addVoter(values.voterAddress);
        if (hash) {
          addToast(`Tx Submitted: ${hash}`, {
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
      <CardHeader
        title="Add a voter"
        subheader="Add a new voter to the polls"
      />
      <CardContent>
        <Formik initialValues={{ voterAddress: "" }} onSubmit={handleSubmit}>
          {({ setFieldValue, errors, touched }) => (
            <Form>
              <Grid direction="column" container spacing={3}>
                <Grid item>
                  <Field
                    component={TextField}
                    name="voterAddress"
                    type="text"
                    label="Voter Address"
                    placeholder="e.g. tz1...."
                    fullWidth
                    onChange={(e: any) => {
                      setFieldValue("voterAddress", e.target.value);
                    }}
                    error={touched.voterAddress && Boolean(errors.voterAddress)}
                    helperText={touched.voterAddress ? errors.voterAddress : ""}
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
