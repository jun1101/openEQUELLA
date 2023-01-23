/*
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0, (the "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at:
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as A from 'fp-ts/Array';
import { constant, constFalse, flow, pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import { not } from 'fp-ts/Predicate';
import * as RA from 'fp-ts/ReadonlyArray';
import * as R from 'fp-ts/Record';
import * as S from 'fp-ts/string';
import * as gen from 'io-ts-codegen';
import { IntFromString } from 'io-ts-types/lib/IntFromString';
import type {
  FileDefinition,
  Import,
  Interface,
  Prop,
  TypeAlias,
} from './parse';
import { pfTernary } from './utils';

const HEADER =
  "/** This file is created by 'io-ts-gen' so please do not modify it. **/";
const IOTS_IMPORT = "import * as t from 'io-ts';";
const IOTSTYPE_IMPORT = "import * as td from 'io-ts-types';\n"; // This one is the last import so add a newline character.

const ArrayRegex = /^(.+)(\[])+$/;
const RecordRegex = /^Record<(.+), (.+)>$/;
const StringLiteralRegex = /^'(\w*)'$/;
const IntLiteralRegex = /^\d+$/;
const FunctionRegex = /^\(.*\) => .+$/;
const UnionRegex = /^\|?\s?(.+\n?\s+\|\s)+(.+)$/;
const TupleRegex = /^\[(.+)]$/;

export interface CodecDefinition {
  targetFile: string;
  content: string;
}

// Use this function to build a TypeReference when only the property's type is what you care.
const plainTypeReference = (
  type: string,
  typeArguments?: string[]
): gen.TypeReference =>
  getTypeReference(
    {
      name: '',
      type,
      properties: [],
      optional: false,
    },
    typeArguments
  );

// Given a property and a list of generic types, find out a matched TypeReference for the property.
const getTypeReference = (
  { type, properties }: Prop,
  typeArguments?: string[]
): gen.TypeReference => {
  switch (true) {
    case type === 'boolean':
      return gen.booleanType;
    case type === 'null':
      return gen.nullType;
    case type === 'number':
      return gen.numberType;
    case type === 'object':
      return gen.typeCombinator(generateProperties(properties, typeArguments));
    case type === 'string':
      return gen.stringType;
    case type === 'undefined':
      return gen.undefinedType;
    case type === 'unknown':
      return gen.unknownType;
    case ArrayRegex.test(type):
      return pipe(
        type.match(ArrayRegex)?.[1],
        O.fromNullable,
        O.foldW(
          () => gen.unknownArrayType,
          (t) => gen.arrayCombinator(plainTypeReference(t, typeArguments))
        )
      );
    case type === 'Date':
      // 'td' is the namespace used in the import of 'io-ts-types'.
      return gen.customCombinator('td.date', 'td.date');
    case FunctionRegex.test(type):
      return gen.functionType;
    case IntLiteralRegex.test(type):
      return pipe(
        type.match(IntLiteralRegex)?.input,
        IntFromString.decode,
        O.fromEither,
        O.foldW(() => gen.unknownType, gen.literalCombinator)
      );
    case RecordRegex.test(type):
      return pipe(
        type.match(RecordRegex),
        O.fromNullable,
        O.foldW(
          () => gen.unknownRecordType,
          ([_, domain, codomain]) =>
            gen.recordCombinator(
              plainTypeReference(domain, typeArguments),
              plainTypeReference(codomain, typeArguments)
            )
        )
      );
    case StringLiteralRegex.test(type):
      return pipe(
        type.match(StringLiteralRegex)?.[1],
        O.fromNullable,
        O.foldW(() => gen.unknownType, gen.literalCombinator)
      );
    case TupleRegex.test(type):
      return pipe(
        type.match(TupleRegex)?.[1],
        O.fromNullable,
        O.map(
          flow(
            S.split(','),
            RA.map(S.trim),
            RA.map(plainTypeReference),
            RA.toArray
          )
        ),
        O.foldW(() => gen.unknownType, gen.tupleCombinator)
      );
    case UnionRegex.test(type):
      return pipe(
        type.match(UnionRegex)?.input,
        O.fromNullable,
        O.map(
          flow(
            S.split('|'),
            RA.map(S.trim),
            RA.filter(not(S.isEmpty)),
            RA.map(plainTypeReference),
            RA.toArray
          )
        ),
        O.foldW(() => gen.unknownType, gen.unionCombinator)
      );
    default:
      // Check whether the property's type is in the list of type argument.
      // If yes, the codec's name must be in the format of 'codecX' where X is a number.
      // If no, the name must be the property's type followed by keyword 'Codec'.
      return pipe(
        typeArguments,
        O.fromNullable,
        O.chain(A.findIndex((arg) => arg === type)),
        O.getOrElse(constant(-1)),
        pfTernary(
          (index) => index >= 0,
          (index) => `codec${index}`,
          () => `${type}Codec`
        ),
        gen.identifier
      );
  }
};

// Return a list of io-ts-codegen Property for the supplied list of Prop.
const generateProperties = (
  props: Prop[],
  typeArguments?: string[]
): gen.Property[] =>
  pipe(
    props,
    A.map((p) =>
      gen.property(p.name, getTypeReference(p, typeArguments), p.optional)
    )
  );

// Return a list of io-ts-codegen Identifier for the supplied list of Interface's name.
const generateExtendIdentifier: (identifiers: string[]) => gen.Identifier[] =
  flow(A.map((identifier) => gen.identifier(`${identifier}Codec`)));

// Generate all the named imports for required Codecs.
const generateImports: (imports: Import[]) => string[] = flow(
  A.map(
    ({ filename, namedImport }) =>
      `import { ${namedImport}Codec } from '${filename}'`
  )
);

// Use io-ts-codegen to build an interfact that does not take type arguments.
const buildNormalInterface = ({
  name,
  properties,
  typeExtended,
}: Interface): gen.TypeDeclaration => {
  const extendIdentifiers = generateExtendIdentifier(typeExtended);
  const props = gen.typeCombinator(generateProperties(properties));

  return gen.typeDeclaration(
    `${name}Codec`,
    A.isNonEmpty(extendIdentifiers)
      ? gen.intersectionCombinator([props, ...extendIdentifiers])
      : props,
    true
  );
};

// is-ts-codegen does not have any support out-of-box for interfaces that takes type arguments.
// A codec for such a function is represented by a function. As a result, we generate a string
// to representation the function and then put the string representation in a customCombinator.
const buildGenericTypeInterface = ({
  name,
  properties,
  typeArguments,
  typeExtended,
}: Interface): gen.TypeDeclaration => {
  const typeParameters = typeArguments
    .map((_, index) => `C${index} extends t.Mixed`)
    .join(',');
  const funcParameters = typeArguments
    .map((_, index) => `codec${index}: C${index}`)
    .join(',');

  const extendIdentifiers = generateExtendIdentifier(typeExtended);
  const props = gen.typeCombinator(
    generateProperties(properties, typeArguments)
  );
  const funcBody = A.isNonEmpty(extendIdentifiers)
    ? gen.intersectionCombinator([props, ...extendIdentifiers])
    : props;

  const stringRepr = `<${typeParameters}>(${funcParameters}) => {
          return ${gen.printRuntime(funcBody)}
     }`;

  return gen.typeDeclaration(
    `${name}Codec`,
    gen.customCombinator(stringRepr, stringRepr),
    true
  );
};

const buildCodecForInterface: (
  interfaceDefinition: Interface
) => gen.TypeDeclaration = flow(
  pfTernary(
    ({ typeArguments }) => A.size(typeArguments) > 0,
    buildGenericTypeInterface,
    buildNormalInterface
  )
);

const buildCodecForTypeAlias = ({
  name,
  referencedType,
}: TypeAlias): gen.TypeDeclaration =>
  gen.typeDeclaration(`${name}Codec`, plainTypeReference(referencedType), true);

// Given a list of sorted TypeDeclaration, return a list of string representing runtime type.
// If recursive type is used in a TypeDeclaration, its static type representation is also added.
const convertTypeDeclarationToString = (
  sorted: (gen.TypeDeclaration | gen.CustomTypeDeclaration)[]
): string[] => {
  // This is a Record where key is name of a TypeDeclaration and value is always `true`.
  const { recursive } = gen.tsort(gen.getTypeDeclarationGraph(sorted));

  const isRecursive = (name: string) =>
    pipe(recursive, R.lookup(name), O.getOrElse(constFalse));

  const toString = (
    typeDeclaration: gen.TypeDeclaration | gen.CustomTypeDeclaration
  ) =>
    `${
      isRecursive(typeDeclaration.name)
        ? `${gen.printStatic(typeDeclaration)}\n`
        : ''
    }${gen.printRuntime(typeDeclaration)}\n`;

  return sorted.map(toString);
};

export const generate = ({
  filename,
  imports,
  interfaces,
  typeAliases,
}: FileDefinition): CodecDefinition =>
  pipe(
    typeAliases,
    A.map(buildCodecForTypeAlias),
    A.concat(interfaces.map(buildCodecForInterface)),
    flow(gen.sort, convertTypeDeclarationToString),
    (typeDeclarations) => [
      HEADER,
      ...generateImports(imports),
      IOTS_IMPORT,
      IOTSTYPE_IMPORT,
      ...typeDeclarations,
    ],
    A.intercalate(S.Monoid)('\n'),
    (content) => ({ targetFile: filename, content })
  );
