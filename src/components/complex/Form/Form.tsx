import React, {
    ButtonHTMLAttributes,
    FormHTMLAttributes,
    LinkHTMLAttributes,
    useMemo,
} from 'react';
import {
    AltUrl, Button, Field, LinkType,
} from 'components/base';
import './Form.scss';
import { FormikType } from 'types';
import { FieldType } from 'components/pages/config';

type Props = FormHTMLAttributes<unknown> & {
    fields: Array<FieldType>
    links?: Array<LinkType>
    readMode?: boolean
    formik?: FormikType
    buttonProps?: ButtonHTMLAttributes<unknown>
    altUrlProps?: LinkHTMLAttributes<unknown>
};

export const Form: React.FC<Props> = React.memo((
    {
        fields,
        links,
        readMode,
        formik,
        buttonProps,
        altUrlProps,
        ...restFormProps
    },
) => (
    <form {...restFormProps} onSubmit={formik?.handleSubmit}>
        <div className='fields__container'>
            {
                useMemo(
                    () => fields.map(
                        (field) => (
                            <Field
                                {...formik?.getFieldProps(field.name)}
                                {...field}
                                key={field.id}
                                readMode={readMode}
                                error={
                                    formik?.touched[field.name as string]
                                    && formik?.errors[field.name as string]
                                }
                            />
                        ),
                    ),
                    [],
                )
            }
        </div>
        <div className='form-buttons__container'>
            {
                readMode && links
                    ? (
                        <div className='form-links'>
                            {
                                links.map(
                                    (link) => <AltUrl {...link} key={link.id} />,
                                )
                            }
                        </div>
                    )
                    : (
                        <div className='form-buttons'>
                            <Button {...buttonProps} />
                            <AltUrl {...altUrlProps} />
                        </div>
                    )
            }
        </div>
    </form>
));
