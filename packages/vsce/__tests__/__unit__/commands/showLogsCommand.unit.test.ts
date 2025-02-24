/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 *
 */

import { imperative } from "@zowe/zowe-explorer-api";
const getProfilesCacheMock = jest.fn();
getProfilesCacheMock.mockReturnValue({
  fetchBaseProfile: (name: string): imperative.IProfileLoaded => {
    var splitString = name.split(".");
    if (splitString.length > 1) {
      return createProfile(splitString[0], "base", "");
    }
    return undefined as unknown as IProfileLoaded;
  },
});

jest.mock("@zowe/cics-for-zowe-sdk");
jest.mock("../../../src/utils/profileManagement", () => ({
  ProfileManagement: {
    getProfilesCache: getProfilesCacheMock,
  },
}));
function createProfile(name: string, type: string, host: string) {
  return {
    name: name,
    message: "",
    type: type,
    failNotFound: false,
    profile: {
      host: host,
    },
  } as imperative.IProfileLoaded;
}
import * as showLogsCommand from "../../../src/commands/showLogsCommand";
import { IProfileLoaded } from "@zowe/imperative";

describe("Test suite for findRelatedZosProfiles", () => {
  let h1z = createProfile("host1.myzosmf", "zosmf", "h1");
  let h1r = createProfile("host1.myrse", "rse", "h1");
  let h2 = createProfile("host2.myzosmf2", "zosmf", "h2");
  let h3 = createProfile("host3.myzosmf3", "zosmf", "h3");
  let h4 = createProfile("host4.myrse4", "rse", "h4");
  let h5z = createProfile("myzosmf5", "zosmf", "h5");
  let h5r = createProfile("myrse5", "rse", "h5");
  let zosProfiles: imperative.IProfileLoaded[] = [h1z, h1r, h2, h3, h4, h5z, h5r];

  it("Profile with common base finds z/osmf", async () => {
    const profile = await showLogsCommand.findRelatedZosProfiles(createProfile("host1.mycics", "cics", "h1"), zosProfiles);
    expect(profile).toEqual(h1z);
  });
  it("Profile with no common base finds same host z/osmf", async () => {
    const profile = await showLogsCommand.findRelatedZosProfiles(createProfile("mycics", "cics", "h1"), zosProfiles);
    expect(profile).toEqual(h1z);
  });
  it("Profile with only RSE and same host picks RSE", async () => {
    const profile = await showLogsCommand.findRelatedZosProfiles(createProfile("host4.mycics", "cics", "h4"), zosProfiles);
    expect(profile).toEqual(h4);
  });
  it("Profile with common base and different host picks connection anyway (unlikely to be a real situation)", async () => {
    const profile = await showLogsCommand.findRelatedZosProfiles(createProfile("host4.mycics", "cics", "h1"), zosProfiles);
    expect(profile).toEqual(h4);
  });
});
