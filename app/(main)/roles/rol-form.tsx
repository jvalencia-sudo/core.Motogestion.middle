"use client";
import PageHeader from "@/components/page-header";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Rol} from "@/lib/types/auth/rol";
import {zodResolver} from "@hookform/resolvers/zod";
import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {crearRol, editarRol} from "@/app/(main)/roles/actions";

const formSchema = z.object({
    nombreRol: z.string().min(1, "El nombre es requerido"),
    descripcionRol: z.string().min(1, "La descripción es requerida"),
});

interface PageProps {
    rol?: Rol; // Rol opcional para modo edición
    isEdit?: boolean;
}

export default function RolForm({rol, isEdit = false}: PageProps) {
    const [error, setError] = useState<string>();
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nombreRol: rol?.nombreRol || "",
            descripcionRol: rol?.descripcionRol || "",
        },
    });

    // Actualizar valores del formulario cuando cambia el rol
    useEffect(() => {
        if (rol) {
            form.reset({
                nombreRol: rol.nombreRol,
                descripcionRol: rol.descripcionRol,
            });
        }
    }, [rol, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        setError(undefined);

        try {
            const resp = isEdit && rol
                ? await editarRol({...rol, ...values} as Rol)
                : await crearRol(values as Rol);

            if (resp?.error) {
                setError(resp.error);
            } else {
                // Esto es para mostrar un mensaje de error
                form.reset();
            }
        } catch (err) {
            setError("Ocurrió un error inesperado");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <PageHeader
                title={isEdit ? "Editar rol" : "Crear rol"}
                subtitle={isEdit ? "Editar rol existente." : "Crear un nuevo rol."}
            />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Card className="mb-4">
                        <CardContent className="py-4">
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-6">
                                    <FormField
                                        control={form.control}
                                        name="nombreRol"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Nombre</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Nombre Rol"
                                                        type="text"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="col-span-6">
                                    <FormField
                                        control={form.control}
                                        name="descripcionRol"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Descripción</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Descripción Rol"
                                                        type="text"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="mt-4 justify-end flex w-full gap-2">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? "Guardando..." : "Guardar"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    {error && (
                        <Card className="border-destructive">
                            <CardContent className="pt-4 text-destructive">
                                {error}
                            </CardContent>
                        </Card>
                    )}
                </form>
            </Form>
        </>
    );
}