# Ziteo UI and usability review

Reviewed and improved the existing seller dashboard, website editor and customer product presentation. The green Ziteo visual identity, existing routes, product records, authentication and publishing APIs were retained.

## Findings and improvements

| Area | Observed friction | Improvement implemented | Intended effect |
| --- | --- | --- | --- |
| Readability | Several 12–13 px helper labels used pale green at 2.55–3.30:1 contrast in sampled pairs. | Darker secondary text: #5f715f gives 5.23:1 on white and 4.97:1 on the status-strip background. Stronger focus rings and selected cards. | Less effort reading controls; easier keyboard orientation. |
| Save confidence | Draft status disappeared on smaller screens; it was difficult to distinguish a safe draft from a live design. | A persistent status strip distinguishes Unsaved edits, Draft saved, and Published, with a clear explanation of live state. | Reduce uncertainty about whether edits are saved or public. |
| Template decisions | Global color choices competed with section templates; the inherited website style had no explicit current-state explanation. | Show the currently applied style, a clear selected check, and Use website style to reset a section override. Global colors stay in Customize. | Fewer competing choices and clearer local versus website-wide effects. |
| Phone preview | Fitting a tall 844 px canvas to the workspace could make the entire mobile preview too small. | Fit mobile preview by width and adapt the scrollable viewport height. Keep labeled Back/Mobile/Desktop controls; use a shorter bottom sheet. Fixed the narrow 320 px toolbar. | More readable preview and controls without losing context. |
| Publication recovery | Publish could return a backend prerequisite error without a direct route to fix it. | A publishing checklist identifies the missing WhatsApp number or visible published product and links to Settings or Products. Leaving still protects drafts. | Prevent avoidable errors and make the next step clear. |
| Seller onboarding | The large welcome card offered general motivational copy instead of the seller’s next task. | Show a specific state-based next action: add contact, publish a product, style the website, publish, or share the link. Checklist labels now match what is actually measured. | Make progress easier to understand and act on. |
| Customer trust | NEW ARRIVAL was assigned by search-result position; variant From prices could include unavailable options and base-product discounts. | Remove inferred novelty labels. Use an in-stock variant starting price when one exists; show exact variant pricing after selection. Replace filler card text with option counts or View details. | Present useful, accurate buying information. |
| Consistent language | Help described old Apply Changes/Publish Changes controls; the publish dialog asserted private access despite current public hosting. | Match Help to Save draft/Publish and describe access settings without assuming the audience. | Keep explanations consistent with the actual app. |

These are heuristic design improvements. Their expected effects are hypotheses; conversion, confidence and task-completion gains were not measured with a user study or A/B test.

## Verification

- TypeScript: passed.
- Unit checks: 33 passed (history, validation, pricing and publishing guidance).
- Local API/database checks: 12 passed; exact original local test store restored. Product and analytics rows unchanged.
- Browser review: 320 x 740, 390 x 844, 768 x 1024 and 1440 x 900. Checked navigation, page switching, template application/reset, undo, keyboard tab switching, readiness recovery and leave protection.
- No browser console errors in the final local review.
- Source diff contains UI components/styles and pure presentation/guidance helpers; no database migration or authentication changes.

## Review basis

The review uses visibility of system status, recognition over recall, error prevention and recovery from [Nielsen Norman Group’s usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/). Accessibility decisions reference W3C guidance for [text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) and [target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html). This was a targeted improvement pass rather than a complete accessibility conformance audit.

## Delivery

Production build passed. Published version 3 at https://ziteo-seller-studio.ahammadrafeef.chatgpt.site/#website. Existing public audience preserved. Source commit: baf7f731262ac504b57ced1a8fbc9e583b91c5c6.

The source ZIP excludes credentials, environment files, dependencies and runtime database contents.
