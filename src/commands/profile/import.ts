/*
 *
 * Copyright 2018-present NEM
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import chalk from 'chalk';
import {command, metadata, option} from 'clime';
import {SimpleWallet} from 'nem2-sdk';
import {AccountCredentialsTable, CreateProfileCommand, CreateProfileOptions} from '../../create.profile.command';
import {DefaultResolver} from '../../resolvers/default.resolver';
import {GenerationHashResolver} from '../../resolvers/generationHash.resolver';
import {NetworkResolver} from '../../resolvers/network.resolver';
import {PasswordResolver} from '../../resolvers/password.resolver';
import {PrivateKeyResolver} from '../../resolvers/privateKey.resolver';
import {ProfileNameResolver} from '../../resolvers/profile.resolver';
import {URLResolver} from '../../resolvers/url.resolver';
import {PrivateKeyValidator} from '../../validators/privateKey.validator';

export class CommandOptions extends CreateProfileOptions {
    @option({
        flag: 'P',
        description: 'Account private key.',
        validator: new PrivateKeyValidator(),
    })
    privateKey: string;
}

@command({
    description: 'Create a new profile with existing private key',
})
export default class extends CreateProfileCommand {

    constructor() {
        super();
    }

    @metadata
    async execute(options: CommandOptions) {
        const networkType = new NetworkResolver().resolve(options);
        const privateKey = new PrivateKeyResolver().resolve(options);
        options.url = new URLResolver().resolve(options);
        const profileName = new ProfileNameResolver().resolve(options);
        const password = new PasswordResolver().resolve(options);
        const isDefault = new DefaultResolver().resolve(options);
        const generationHash = await new GenerationHashResolver().resolve(options);

        const simpleWallet = SimpleWallet.createFromPrivateKey(
            profileName,
            password,
            privateKey,
            networkType);
        console.log(new AccountCredentialsTable(simpleWallet.open(password), password).toString());
        this.createProfile(simpleWallet, networkType, options.url, isDefault, generationHash);
        console.log( chalk.green('\nStored ' + profileName + ' profile'));
    }
}
