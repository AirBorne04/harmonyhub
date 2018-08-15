var expect = require('chai').expect;


describe("client", function() {

  it("import", function() {
    // Calling `done()` twice is an error
    var harmony = require("../packages/client/dist");
  
    expect(harmony).to.be.an("object");
    expect(harmony).to.have.property("default");
    expect(harmony).to.have.property("getHarmonyClient");
  });

  it("util", function() {
    var util = require("../packages/client/dist/util");

    expect(util).to.be.an("object");
    expect(util).to.have.property("default");
    expect(util.default).to.have.property("getUniqueId");
    expect(util.default).to.have.property("decodeColonSeparatedResponse");
    expect(util.default).to.have.property("buildIqStanza");

    // test unique for 1000 runs
    var idList = [], ex = util.default.getUniqueId();

    for(var i = 0; i < 1000; ++i) {
      idList.push(
        util.default.getUniqueId()
      );
    }
    
    expect(idList).not.to.include(ex);

    // test stanza build
    var testStanza = util.default.buildIqStanza(
      "test", "xmlns", "text/xml", "body test", "from"
    );
    
    expect(testStanza.toString()).to.include(
      'from="from"><oa xmlns="xmlns" mime="text/xml">body test</oa></iq>'
    );
    expect(testStanza).to.not.eq(null);
    expect(testStanza.name).to.eq("iq");
    expect(testStanza).to.have.property("children")
                      .to.be.an("array")
                      .with.lengthOf(1);
    expect(testStanza.attrs).to.have.property("type").to.be.eq("test");
    expect(testStanza.attrs).to.have.property("from").to.be.eq("from");
    expect(testStanza.children[0].attrs).to.have.property("xmlns").to.be.eq("xmlns");
    expect(testStanza.children[0].attrs).to.have.property("mime").to.be.eq("text/xml");
    expect(testStanza.children[0]).to.have.property("children").to.deep.eq(["body test"]);

    // test decode colon separated response
    var decodeResponse = util.default.decodeColonSeparatedResponse(
      "test:abc=xyz"
    );

    expect(decodeResponse).to.be.an("object");
    expect(decodeResponse).to.have.property("abc").to.be.eq("xyz");
  });

});

describe("discover", function() {
  it("ping", function() {
    var ping = require("../packages/discover/dist/ping"),
        pinger = new ping.Ping();

    // test auto detect broadcast ip needed on windows
    if (/^win/i.test(process.platform)) {
      expect(pinger.options.address).to.be.an("array");
      expect(pinger.options.address[0].split(".")[3]).to.be.equal("255");
    }
    else {
      expect(pinger.options.address).to.be.equal("255.255.255.255");
    }

    // test start and stop change of pinger state
    expect(pinger._socket).to.be.undefined;
    expect(pinger.intervalToken).to.be.undefined;
    pinger.start();
    expect(pinger.socket).to.be.an("object");
    expect(pinger.intervalToken).to.be.an("object");
    pinger.stop();
    expect(pinger.socket).to.be.undefined;
    expect(pinger.intervalToken).to.be.undefined;
  })

});

  