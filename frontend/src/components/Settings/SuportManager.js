import React, { useEffect, useState, useContext } from "react";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import useSettings from "../../hooks/useSettings";
import OnlyForSuperUser from "../OnlyForSuperUser";
import useAuth from "../../hooks/useAuth.js";
import { makeStyles } from "@material-ui/core/styles";
import { i18n } from "../../translate/i18n";
import ColorModeContext from "../../layout/themeContext";
import { toast } from 'react-toastify';

const useStyles = makeStyles((theme) => ({
  selectContainer: { width: "100%", textAlign: "left" },
}));

const phoneRegExp = /^\+\d{10,15}$/;

const validationSchema = Yup.object().shape({
  suportContact: Yup.string()
    .matches(phoneRegExp, i18n.t("settings.suportContact.invalid"))
    .required(i18n.t("settings.suportContact.required")),
});

const formatPhone = (value) => {
  const numbersOnly = value.replace(/\D/g, '');
  if (!numbersOnly) return '';
  return '+' + numbersOnly.slice(0, 15);
};

export default function SuportManager({ settings }) {
  const classes = useStyles();
  const { getCurrentUserInfo } = useAuth();
  const { update } = useSettings();
  const [currentUser, setCurrentUser] = useState({});
  const [suportContact, setSuportContact] = useState("");

  useEffect(() => {
    getCurrentUserInfo().then(setCurrentUser);
    if (Array.isArray(settings) && settings.length) {
      const suportContact = settings.find((s) => s.key === "suportContact")?.value;
      setSuportContact(suportContact || "");
    }
    // eslint-disable-next-line
  }, [settings]);

  async function handleSaveSetting(key, value) {
    await update({ key, value });
    toast.success(i18n.t("settings.success"));
  }

  return (
    <Grid spacing={3} container>
      <OnlyForSuperUser
        user={currentUser}
        yes={() => (
          <Grid xs={12} sm={6} md={4} item>
            <Formik
              initialValues={{ suportContact: suportContact || "" }}
              validationSchema={validationSchema}
              enableReinitialize
              onSubmit={async (values) => {
                await handleSaveSetting("suportContact", values.suportContact);
                setSuportContact(values.suportContact);
              }}
            >
              {({ errors, touched, values, setFieldValue, handleBlur, submitForm }) => (
                <Form>
                  <FormControl className={classes.selectContainer}>
                    <Field
                      as={TextField}
                      id="suportContact-field"
                      label={i18n.t("settings.suportContact.label")}
                      variant="outlined"
                      name="suportContact"
                      value={values.suportContact}
                      onChange={(e) => {
                        const formattedValue = formatPhone(e.target.value);
                        setFieldValue('suportContact', formattedValue);
                        setSuportContact(formattedValue);
                      }}
                      onBlur={(e) => {
                        handleBlur(e);
                        if (!errors.suportContact) submitForm();
                      }}
                      error={touched.suportContact && Boolean(errors.suportContact)}
                      helperText={touched.suportContact && errors.suportContact}
                      placeholder="+5519996609924"
                      fullWidth
                      InputProps={{
                        inputProps: { maxLength: 16 }
                      }}
                    />
                  </FormControl>
                </Form>
              )}
            </Formik>
          </Grid>
        )}
      />
    </Grid>
  );
}
