import React from 'react';

import { wrapComponent, startApp, sendSmartAppData } from '../../testHelpers/testRenderHelpers';
import { Header } from '../Header/Header';
import { HeaderProps } from '../Header/types';

import { VoiceLabels, FieldProps } from './types';
import { VoiceFieldProps } from './components/VoiceField';

import { Form, FormField, VoiceField, Input, DatePicker } from '.';

type VoiceTestField<T = any> = {
    type: 'voice';
    labels: VoiceLabels;
} & Partial<VoiceFieldProps<T>>;

type ManualTestField = {
    type: 'manual';
    label: string;
};

type TestField<T> = (VoiceTestField<T> | ManualTestField) & {
    component: React.FC<FieldProps<T>>;
} & Partial<FieldProps<T>>;

interface CreateForm {
    <D extends { [key: string]: unknown }>(fields: { [K in keyof D]: TestField<D[K]> }): React.FC<{
        initialData: { [K1 in keyof D]: any };
        onSubmit?: (data: { [K1 in keyof D]: any }) => void;
        initialField?: keyof D;
        header?: HeaderProps;
    }>;
}

const propsForVoiceField = (props: VoiceTestField | ManualTestField): props is VoiceTestField => props.type === 'voice';

const formatDate = (value?: string) => {
    if (!value) {
        return '';
    }

    const dateParts = new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).formatToParts(new Date(value));

    if (dateParts[dateParts.length - 1].type === 'literal') {
        dateParts.pop(); // исключаем последний элемент, который является литералом `г.`
    }

    let result = '';

    for (const part of dateParts) {
        result += part.value;
    }

    return result;
};

const createForm: CreateForm = (fields) => (props) => {
    const sequence = Object.keys(fields);
    const onSubmitFunction = (data) => {
        if (props.onSubmit) {
            props.onSubmit(data);
        }
    };

    return (
        <>
            <Header {...props.header} />
            <Form
                sequence={sequence}
                initialData={props.initialData}
                onSubmit={onSubmitFunction}
                initialField={props.initialField}
            >
                {({ active, data, onSubmit, onChange }) => {
                    return sequence.map((name) => {
                        const field = fields[name];
                        const { component: InputComponent, ...rest } = field;

                        const fieldToRender = propsForVoiceField(field) ? (
                            <VoiceField
                                labels={field.labels}
                                onSubmit={onSubmit}
                                onChange={onChange}
                                value={data[name]}
                                manualMode={false}
                                formatter={field.formatter}
                                component={InputComponent}
                            />
                        ) : (
                            <InputComponent {...rest} onSubmit={onSubmit} onChange={onChange} value={data[name]} />
                        );

                        return (
                            <FormField name={name} active={active as string} key={name}>
                                {fieldToRender}
                            </FormField>
                        );
                    });
                }}
            </Form>
        </>
    );
};

type FormData = {
    name: string;
    date: string;
};

function initTestForm<C extends React.ComponentType<any>, P extends React.ComponentProps<C>>(component: C, props: P) {
    return startApp(
        [
            {
                name: 'form',
                component: wrapComponent(component, props),
            },
        ],
        ({ pushScreen }) => pushScreen('form'),
    );
}

describe('Form', { scrollBehavior: false }, () => {
    let onSubmitStub: () => void;

    beforeEach(() => {
        onSubmitStub = cy.stub();

        initTestForm(
            createForm<FormData>({
                name: {
                    type: 'manual',
                    component: Input,
                    label: 'Name',
                },
                date: {
                    type: 'voice',
                    component: (props) => {
                        return (
                            <DatePicker
                                {...props}
                                value={new Date(props.value)}
                                max={new Date('2022-12-31')}
                                min={new Date('2020-01-01')}
                            />
                        );
                    },
                    labels: {
                        one: 'Дата',
                        suggestion: 'дату',
                        hint: 'Подсказка для поля',
                    },
                    formatter: formatDate,
                },
            }),
            {
                initialData: {
                    name: '',
                    date: '2020-01-01',
                },
                onSubmit: onSubmitStub,
                initialField: 'name',
            },
        );
    });
});

describe('Form -- different types of fields', () => {
    it('render', () => {
        initTestForm(
            createForm<{ date: string | Date }>({
                date: {
                    type: 'manual',
                    label: 'Date',
                    component: ({ value: _, ...props }) => (
                        <DatePicker {...props} min={new Date('2020-01-01')} max={new Date('2023-12-31')} />
                    ),
                },
            }),
            {
                initialData: {
                    date: '2020-06-15',
                },
            },
        ).then(() => {
            cy.matchImageSnapshot({
                failureThreshold: 0.1,
                failureThresholdType: 'percent',
            });
        });
    });
});

describe('reaction on user actions', { scrollBehavior: false }, () => {
    let onSubmitStub: () => void;

    beforeEach(() => {
        onSubmitStub = cy.stub();
        initTestForm(
            createForm({
                name: {
                    type: 'voice',
                    component: Input,
                    labels: {
                        one: 'Имя',
                        many: 'Выберите имя',
                        suggestion: 'имя',
                        hint: 'для заказа',
                        description: 'Имя подтребуется для подтверждения заказа',
                    },
                },
            }),
            {
                initialData: { name: '' },
                onSubmit: onSubmitStub,
            },
        );
    });

    it('get error from voice action', () => {
        sendSmartAppData({
            type: 'fieldFillError',
            payload: {
                value: ['Something went wrong'],
            },
        });

        cy.matchImageSnapshot();
    });

    it('reject action call', () => {
        sendSmartAppData({
            type: 'fieldFill',
            payload: {
                value: ['Inav Ivanov'],
            },
        });

        sendSmartAppData({
            type: 'reject',
        });
    });

    it('skip action call', () => {
        sendSmartAppData({
            type: 'skip',
        }).then(() => {
            expect(onSubmitStub).to.be.calledWith({ name: '' });
        });
    });

    it('confirm action call', () => {
        sendSmartAppData({
            type: 'fieldFill',
            payload: {
                value: ['Inav Ivanov'],
            },
        })
            .then(() => {
                return sendSmartAppData({
                    type: 'confirm',
                });
            })
            .then(() => {
                expect(onSubmitStub).to.be.calledWith({
                    name: 'Inav Ivanov',
                });
            });
    });
});
