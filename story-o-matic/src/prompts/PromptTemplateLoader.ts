import { templates } from './templateImports';

export class PromptTemplateLoader {
  loadTemplate(templateName: string): string {
    const template = templates[templateName];
    if (!template) {
      throw new Error(`Template not found: ${templateName}`);
    }
    return template;
  }

  fillTemplate(templateName: string, replacements: Record<string, string>): string {
    let template = this.loadTemplate(templateName);

    Object.entries(replacements).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(placeholder, value);
    });

    return template;
  }
}