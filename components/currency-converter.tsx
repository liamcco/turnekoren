"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { euroFormatter, sekFormatter } from "@/lib/formatting";

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

interface CurrencyConverterProps {
  rate: number;
  inverse: number;
}

export function CurrencyConverter({ rate, inverse }: CurrencyConverterProps) {
  const [eurValue, setEurValue] = useState("");
  const [sekValue, setSekValue] = useState("");

  function handleEurChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setEurValue(raw);
    const num = parseFloat(raw);
    setSekValue(Number.isFinite(num) ? String(roundToTwoDecimals(num * rate)) : "");
  }

  function handleSekChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setSekValue(raw);
    const num = parseFloat(raw);
    setEurValue(Number.isFinite(num) ? String(roundToTwoDecimals(num * inverse)) : "");
  }

  const eurNum = parseFloat(eurValue);
  const sekNum = parseFloat(sekValue);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom amount</CardTitle>
        <CardDescription>Enter an amount in either currency to convert.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="eur-input">Euro (EUR)</Label>
          <Input
            id="eur-input"
            type="number"
            min="0"
            step="any"
            placeholder="e.g. 42.50"
            value={eurValue}
            onChange={handleEurChange}
          />
          {Number.isFinite(eurNum) && eurNum > 0 && (
            <p className="text-sm text-muted-foreground">
              {euroFormatter.format(eurNum)} = <span className="font-medium text-foreground">{sekFormatter.format(eurNum * rate)}</span>
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sek-input">Swedish krona (SEK)</Label>
          <Input
            id="sek-input"
            type="number"
            min="0"
            step="any"
            placeholder="e.g. 500"
            value={sekValue}
            onChange={handleSekChange}
          />
          {Number.isFinite(sekNum) && sekNum > 0 && (
            <p className="text-sm text-muted-foreground">
              {sekFormatter.format(sekNum)} = <span className="font-medium text-foreground">{euroFormatter.format(sekNum * inverse)}</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
