import { Button } from "../../../ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../../../ui/dialog";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LayoutTemplate } from "lucide-react";
import { useState } from "react";
import { TEMPLATES } from "../../templates/data";
import { INSERT_TEMPLATE_COMMAND } from "./index";

export function TemplateDialog() {
    const [editor] = useLexicalComposerContext();
    const [open, setOpen] = useState(false);

    const insertTemplate = (content: string) => {
        editor.dispatchCommand(INSERT_TEMPLATE_COMMAND, content);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="Toolbar" className="border-none" tip="Insert Template">
                    <LayoutTemplate className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Choose a Template</DialogTitle>
                    <DialogDescription>
                        Select a template to get started quickly.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {TEMPLATES.map((template) => (
                        <Button
                            key={template.id}
                            variant="outline"
                            className="justify-start h-auto flex-col items-start gap-1"
                            onClick={() => insertTemplate(template.content)}
                        >
                            <span className="font-medium">{template.name}</span>
                            <span className="text-xs text-muted-foreground">
                                {template.description}
                            </span>
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
