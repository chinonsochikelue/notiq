export interface Template {
    id: string;
    name: string;
    description: string;
    content: string; // Markdown content
}

export const TEMPLATES: Template[] = [
    {
        id: "meeting-notes",
        name: "Meeting Notes",
        description: "Standard meeting minutes format",
        content: `# Meeting Notes
Date: 
attendees: 

## Agenda
1. 
2. 

## Action Items
- [ ] 
- [ ] 
`
    },
    {
        id: "daily-journal",
        name: "Daily Journal",
        description: "Reflect on your day",
        content: `# Daily Journal
Date: 

## Highlights
- 

## Challenges
- 

## Plan for Tomorrow
- 
`
    },
    {
        id: "product-spec",
        name: "Product Specification",
        description: "Define a new feature or product",
        content: `# Product Spec: [Title]

## Problem Statement
What problem are we solving?

## Solution
Describe the solution.

## Requirements
- Requirement 1
- Requirement 2
`
    }
];
