import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateInventoryItemData } from "@/lib/types/inventory/inventory";
import React from "react";
import { Control } from "react-hook-form";

interface AttributesSectionProps {
    control: Control<CreateInventoryItemData | Partial<CreateInventoryItemData>>;
    occasions: Array<{ value: string; label: string }>;
    genders: Array<{ value: string; label: string }>;
    styles: Array<{ value: string; label: string }>;
}

export const AttributesSection: React.FC<AttributesSectionProps> = ({
    control,
    occasions,
    genders,
    styles,
}) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Attributes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <FormField
                        control={control}
                        name="occasion"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Occasion</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Occasion"/>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {occasions.map((occasion) => (
                                            <SelectItem key={occasion.value} value={occasion.value}>
                                                {occasion.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="gender"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Gender</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {genders.map((gender) => (
                                            <SelectItem key={gender.value} value={gender.value}>
                                                {gender.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                   <FormField
                        control={control}
                        name="style"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Style</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select style" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {styles.map((style) => (
                                            <SelectItem key={style.value} value={style.value}>
                                                {style.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                   />
                </div>
            </CardContent>
        </Card>
    )
}