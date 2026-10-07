PS C:\Users\user\Desktop\abdoul\dev\ui-test> bun x tsc --noEmit
src/app/explore.tsx:11:10 - error TS2305: Module '"@/constants/theme"' has no exported member 'BottomTabInset'.

11 import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
            ~~~~~~~~~~~~~~

src/app/explore.tsx:11:26 - error TS2305: Module '"@/constants/theme"' has no exported member 'MaxContentWidth'.

11 import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
                            ~~~~~~~~~~~~~~~

src/app/explore.tsx:11:43 - error TS2305: Module '"@/constants/theme"' has no exported member 'Spacing'.

11 import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
                                             ~~~~~~~

src/components/app-tabs.tsx:4:10 - error TS2305: Module '"@/constants/theme"' has no exported member 'Colors'.

4 import { Colors } from '@/constants/theme';
           ~~~~~~

src/components/app-tabs.web.tsx:16:10 - error TS2305: Module '"@/constants/theme"' has no exported member 'Colors'.

16 import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';
            ~~~~~~

src/components/app-tabs.web.tsx:16:18 - error TS2305: Module '"@/constants/theme"' has no exported member 'MaxContentWidth'.

16 import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';
                    ~~~~~~~~~~~~~~~

src/components/app-tabs.web.tsx:16:35 - error TS2305: Module '"@/constants/theme"' has no exported member 'Spacing'.

16 import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';
                                     ~~~~~~~

src/components/hint-row.tsx:7:10 - error TS2305: Module '"@/constants/theme"' has no exported member 'Spacing'.

7 import { Spacing } from '@/constants/theme';
           ~~~~~~~

src/components/themed-text.tsx:3:10 - error TS2305: Module '"@/constants/theme"' has no exported member 'Fonts'.

3 import { Fonts, ThemeColor } from '@/constants/theme';
           ~~~~~

src/components/themed-text.tsx:3:17 - error TS2305: Module '"@/constants/theme"' has no exported member 'ThemeColor'.

3 import { Fonts, ThemeColor } from '@/constants/theme';
                  ~~~~~~~~~~

src/components/themed-view.tsx:3:10 - error TS2305: Module '"@/constants/theme"' has no exported member 'ThemeColor'.

3 import { ThemeColor } from '@/constants/theme';
           ~~~~~~~~~~

src/components/ui/collapsible.tsx:8:10 - error TS2305: Module '"@/constants/theme"' has no exported member 'Spacing'.

8 import { Spacing } from '@/constants/theme';
           ~~~~~~~

src/components/ui/liquid/liquid-glow.tsx:9:32 - error TS2307: Cannot find module 'expo-linear-gradient' or its corresponding type declarations.

9 import { LinearGradient } from "expo-linear-gradient";
                                 ~~~~~~~~~~~~~~~~~~~~~~

src/components/ui/liquid/liquid-highlight.tsx:12:32 - error TS2307: Cannot find module 'expo-linear-gradient' or its corresponding type declarations.

12 import { LinearGradient } from 'expo-linear-gradient';
                                  ~~~~~~~~~~~~~~~~~~~~~~

src/components/ui/liquid/liquid-surface.tsx:23:26 - error TS2307: Cannot find module 'expo-blur' or its corresponding type declarations.

23 import { BlurView } from "expo-blur";
                            ~~~~~~~~~~~

src/components/web-badge.tsx:8:10 - error TS2305: Module '"@/constants/theme"' has no exported member 'Spacing'.

8 import { Spacing } from '@/constants/theme';
           ~~~~~~~

src/hooks/use-theme.ts:6:10 - error TS2305: Module '"@/constants/theme"' has no exported member 'Colors'.

6 import { Colors } from '@/constants/theme';
           ~~~~~~


Found 17 errors in 12 files.

Errors  Files
     3  src/app/explore.tsx:11
     1  src/components/app-tabs.tsx:4
     3  src/components/app-tabs.web.tsx:16
     1  src/components/hint-row.tsx:7
     2  src/components/themed-text.tsx:3
     1  src/components/themed-view.tsx:3
     1  src/components/ui/collapsible.tsx:8
     1  src/components/ui/liquid/liquid-glow.tsx:9
     1  src/components/ui/liquid/liquid-highlight.tsx:12
     1  src/components/ui/liquid/liquid-surface.tsx:23
     1  src/components/web-badge.tsx:8
     1  src/hooks/use-theme.ts:6
PS C:\Users\user\Desktop\abdoul\dev\ui-test> bun x tsc --noEmit
tsconfig.json:15:5 - error TS5101: Option 'baseUrl' is deprecated and will stop functioning in TypeScript 7.0. Specify compilerOption '"ignoreDeprecations": "6.0"' to silence this error.
  Visit https://aka.ms/ts6 for migration information.

15     "baseUrl": "."
       ~~~~~~~~~


Found 1 error in tsconfig.json:15

PS C:\Users\user\Desktop\abdoul\dev\ui-test>