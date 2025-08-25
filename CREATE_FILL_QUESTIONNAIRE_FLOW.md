# Questionnaire Creation & Fill Flow

This document clarifies how links are generated and how a questionnaire instance is created and filled.

## Overview
- Route: `/start/:templateId`
- Param meaning: `:templateId` is a Template ID (not a Questionnaire ID).
- Questionnaire creation happens when a respondent opens the `/start/:templateId` route.

## Flow
1. Admin opens the Templates list and clicks the “link” action on a template item.
2. The client creates a share URL using the template id already in memory: `/start/<templateId>`.
   - No server call is made at this step.
3. Admin shares the generated link with one or more respondents.
4. A respondent opens the link in their browser and lands on `/start/:templateId`.
5. On first load of this route, the client calls the server to create a new Questionnaire instance for this respondent, tied to the `templateId` from the URL.
   - The server returns a new Questionnaire (with its own id and initial state) for the respondent to fill.
6. After creation, the flow proceeds to early steps (e.g., basic info collection, potential login), and only then moves on to displaying the questions for answering.
   - For now, these steps are noted but not implemented.

## Key Points
- `/start/:templateId` uses a Template ID.
- The share link is constructed entirely on the client, without contacting the server.
- The Questionnaire is created server-side only when a respondent visits the link.

## Out of Scope (for now)
- Implementing respondent info collection or login on the new route.
- Rendering the actual questions on the respondent route.
- Changing current code; this document defines the intended flow.
