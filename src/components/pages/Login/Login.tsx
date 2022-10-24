import React, {FC, useEffect, useState} from 'react';
import { useSelector } from "react-redux";
import { Form } from 'components/complex';
import './Login.scss';
import { FormikValues, useFormik } from 'formik';
import { object } from 'yup';
import { useNavigate } from 'react-router-dom';
import { commonSchema } from 'utils/validation';
import { loginFields } from 'components/pages/config';
import AuthService, { LoginFormData } from 'api/AuthAPI'
import { login, authYandex } from "slices/base";
import { clearMessage } from "slices/message";
import { ReactComponent as Loading } from 'images/loading.svg';
import { ReactComponent as Oauth } from 'images/yoauth.svg';
import { RootState, useAppDispach } from 'store'

const {login: loginSchema, password: passwordSchema} = commonSchema;
const validationSchema = object().shape({
    login: loginSchema,
    password: passwordSchema,
});

export const Login: FC = () => {
    const [loading, setLoading] = useState(false);
    const { message } = useSelector((state: RootState) => state.message);
    const dispatch = useAppDispach();
    
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(clearMessage());
    }, [dispatch]);

    useEffect(() => {
        const code = window.location.search.replace('?code=', '');
        if(code) {
            const data = new FormData();
            data.append('code', code)
            data.append('grant_type', "authorization_code")
            data.append('client_id', "953cad724caf4fc28c183ff9ab6adb8a")
            data.append('client_secret', "b17c03074fb345cd98b19795ab509993")

            dispatch(authYandex(data as FormData))
                .unwrap()
                .then(() => {
                    setTimeout(() => navigate('/'), 0);
                })
                .catch((e: Error) => {
                    console.error(e.message);
                });
        }
    }, []);

    const formik = useFormik<FormikValues>({
        initialValues: {
            login: '',
            password: '',
        },
        validationSchema,
        onSubmit: data => {
            setLoading(true);
            dispatch(login(data as LoginFormData))
                .unwrap()
                .then(() => {
                    setTimeout(() => navigate('/'), 1000);
                })
                .catch((e: Error) => {
                    console.error(e.message);
                    setLoading(false);
                });
        },
    });

    const OAuthEl = () => {
        const [serviceId] = useState('953cad724caf4fc28c183ff9ab6adb8a');
        const REDIRECT_URI = 'http://localhost:3000/login';

        useEffect(() => {
            AuthService.authYandexServiceId(REDIRECT_URI).then(res => 
                // setServiceId(res.service_id)
                {}
            );
        }, [])

        return (
            <div className="login__oauth">
                <a className="login__oauth-link" href={`https://oauth.yandex.ru/authorize?response_type=code&client_id=${serviceId}&redirect_uri=${REDIRECT_URI}`}>
                    <Oauth />
                </a>
            </div>
        );
    }

    return (
        <div className='login__window'>
            <div className='login__container'>
                <div className='login__title'>
                    Авторизация
                </div>
                <Form
                    className='form-info'
                    fields={loginFields}
                    formik={formik}
                    buttonProps={{
                        children: message ? message : loading ? (
                            <span className='button-loading'>
                                <Loading />
                            </span>
                        ) : 'Вход',
                        type: 'submit',
                        disabled: loading ? true : false
                    }}
                    custom={OAuthEl}
                    altUrlProps={{
                        children: 'Ещё не зарегистрированы?',
                        onClick: () => navigate('/registration'),
                    }}
                />
            </div>
        </div>
    );
};
