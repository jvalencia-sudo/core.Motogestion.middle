"use client";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Rol } from "@/lib/types/auth/rol";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {crearRol} from "@/app/(main)/roles/actions";


const formSchema = z.object({
    nombreRol: z.string(),
    descripcionRol: z.string().email(),
});

export default function Page() {
    const [error, setError] = useState<string>();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const resp = await crearRol(values as Rol);
        if (resp?.error) {
            setError(resp.error);
        }
    }

    return (
        <>
            <PageHeader title="Crear vista" subtitle="Crear una nueva vista." />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Card className="mb-4">
                        <CardContent className="py-4">
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-6">
                                    <FormField
                                        control={form.control}
                                        name="nombreRol"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nombre</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Nombre Rol"
                                                        type="text"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="col-span-6">
                                    <FormField
                                        control={form.control}
                                        name="descripcionRol"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Descripcion</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Descripcion Rol"
                                                        type="text"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="mt-4 justify-end flex w-full">
                                <Button type="submit">Guardar</Button>
                            </div>
                        </CardContent>
                    </Card>
                    {/* {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )} */}
                </form>
            </Form>
        </>
    );
}
