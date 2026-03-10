import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OrganizationRichTextFieldProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

function buildPreviewDocument(content: string) {
  const safeContent = content.trim()
    ? content
    : "<p style=\"color:#6b7280;font-family:ui-sans-serif,system-ui,sans-serif;\">Preview will appear here when you add content.</p>";

  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body {
          margin: 0;
          padding: 16px;
          font-family: ui-sans-serif, system-ui, sans-serif;
          color: #111827;
          line-height: 1.6;
        }
        a { color: #2563eb; }
        img { max-width: 100%; height: auto; }
      </style>
    </head>
    <body>${safeContent}</body>
  </html>`;
}

export function OrganizationRichTextField({
  id,
  label,
  value,
  placeholder,
  helperText,
  error,
  disabled,
  onChange,
}: OrganizationRichTextFieldProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        {helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}
      </div>

      <Tabs defaultValue="edit" className="w-full">
        <TabsList>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="edit">
          <Textarea
            id={id}
            value={value}
            disabled={disabled}
            rows={7}
            placeholder={placeholder}
            className={error ? "border-destructive focus-visible:ring-destructive" : ""}
            onChange={(event) => onChange(event.target.value)}
          />
        </TabsContent>
        <TabsContent value="preview">
          <div className="overflow-hidden rounded-xl border bg-white">
            <iframe
              title={`${id}-preview`}
              sandbox=""
              srcDoc={buildPreviewDocument(value)}
              className="h-64 w-full border-0"
            />
          </div>
        </TabsContent>
      </Tabs>

      {error ? (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      ) : null}
    </div>
  );
}