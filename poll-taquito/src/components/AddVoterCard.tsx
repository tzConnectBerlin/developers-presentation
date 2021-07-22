import * as React from "react";
import * as Yup from "yup";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import { Formik, Form, Field } from "formik";
import { Button, Grid } from "@material-ui/core";
import { useWallet } from "@tz-contrib/react-wallet-provider";
import { addVoter } from "../contract";
import { useToasts } from "react-toast-notifications";
import { validateAddress } from "@taquito/utils";
import { FormikTextField } from "./FormikTextField";

export default function AddVoterCard() {
  const { connected } = useWallet();
  const { addToast } = useToasts();

  const validationSchema = Yup.object().shape({
    voterAddress: Yup.string()
      .test({
        test: (value) => validateAddress(value) === 3,
        message: "Invalid Address",
      })
      .required("Required"),
  });
  const handleSubmit = async (values: any, helper: any) => {
    if (connected) {
      try {
        const hash = await addVoter(values.voterAddress);
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
      <CardHeader
        title="Add a voter"
        subheader="Add a new voter to the polls"
      />
      <CardContent>
        <Formik
          initialValues={{ voterAddress: "" }}
          onSubmit={handleSubmit}
          validationSchema={validationSchema}
          validateOnChange
          validateOnBlur
        >
          {({ setFieldValue, errors, touched, isValid, dirty, values }) => (
            <Form>
              <Grid direction="column" container spacing={3}>
                <Grid item>
                  <Field
                    component={FormikTextField}
                    name="voterAddress"
                    type="text"
                    label="Voter Address"
                    placeholder="e.g. tz1...."
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
