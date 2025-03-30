const { expectRevert } = require("@openzeppelin/test-helpers");
const { web3 } = require("hardhat");
const truffleAssert = require("truffle-assertions");

const SphereXEngineMock = artifacts.require("SphereXEngineMock");
const VulnerablePoolMock = artifacts.require("VulnerablePoolMock");
const SphereXBypassVulnerability = artifacts.require("SphereXBypassVulnerability");
const SecurePoolMock = artifacts.require("SecurePoolMock");

contract("SphereXEngine Validation Bypass", function (accounts) {
  const [owner, user1, attacker, hiddenReceiver] = accounts;

  let sphereXEngine;
  let vulnerablePool;
  let bypassContract;

  beforeEach(async function () {
    // Configurar contratos
    sphereXEngine = await SphereXEngineMock.new();
    vulnerablePool = await VulnerablePoolMock.new(sphereXEngine.address);

    // Configurar SphereX para validar transacciones
    await sphereXEngine.toggleRevert(); // Activar validación (comienza a revertir en llamadas protegidas)
    await sphereXEngine.addAllowedSender(vulnerablePool.address);

    // Usuario deposita fondos
    await vulnerablePool.deposit({ from: user1, value: web3.utils.toWei("5", "ether") });

    // Configurar contrato de bypass
    bypassContract = await SphereXBypassVulnerability.new(vulnerablePool.address, { from: attacker });
  });

  it("should protect direct access to sensitive functions", async function () {
    // Debería fallar porque SphereX está activo y la función withdraw está protegida
    await expectRevert(
      vulnerablePool.withdraw(web3.utils.toWei("1", "ether"), { from: user1 }),
      "SphereXEngineMock: malicious tx",
    );
  });

  it("should allow bypass of validation through unprotected functions", async function () {
    // Estado inicial
    const initialPoolBalance = await web3.eth.getBalance(vulnerablePool.address);
    assert.equal(initialPoolBalance, web3.utils.toWei("5", "ether"), "Pool should have 5 ETH initially");

    // Comprobar balance de usuario en el contrato
    const initialUserBalance = await vulnerablePool.userBalances(user1);
    assert.equal(initialUserBalance, web3.utils.toWei("5", "ether"), "User should have 5 ETH balance");

    // Atacante intenta robar fondos evadiendo la validación de SphereX
    await bypassContract.executeBypass(attacker, web3.utils.toWei("5", "ether"), { from: attacker });

    // Verificar que el ataque tuvo éxito
    const finalPoolBalance = await web3.eth.getBalance(vulnerablePool.address);
    assert.equal(finalPoolBalance, "0", "Pool should have 0 ETH after attack");

    // El balance registrado del usuario en el contrato ahora es incorrecto
    const finalUserBalance = await vulnerablePool.userBalances(user1);
    assert.equal(finalUserBalance, "0", "User balance should be 0 after attack");
  });

  it("should allow sending funds to hidden address through bypass", async function () {
    // Estado inicial
    const initialPoolBalance = await web3.eth.getBalance(vulnerablePool.address);
    assert.equal(initialPoolBalance, web3.utils.toWei("5", "ether"), "Pool should have 5 ETH initially");

    // Balance inicial del receptor oculto
    const initialReceiverBalance = await web3.eth.getBalance(hiddenReceiver);

    // Atacante intenta robar fondos y enviarlos a una dirección oculta
    await bypassContract.executeBypass(hiddenReceiver, web3.utils.toWei("5", "ether"), { from: attacker });

    // Verificar que los fondos fueron al receptor oculto
    const finalPoolBalance = await web3.eth.getBalance(vulnerablePool.address);
    assert.equal(finalPoolBalance, "0", "Pool should have 0 ETH after attack");

    const finalReceiverBalance = await web3.eth.getBalance(hiddenReceiver);
    assert.equal(
      web3.utils.toBN(finalReceiverBalance).sub(web3.utils.toBN(initialReceiverBalance)).toString(),
      web3.utils.toWei("5", "ether"),
      "Hidden receiver should have received 5 ETH",
    );
  });

  it("should prevent bypass attacks in secure implementation", async function () {
    // Configurar pool seguro
    const securePool = await SecurePoolMock.new(sphereXEngine.address);

    // Usuario deposita fondos - debería fallar porque la validación SphereX está activa
    await expectRevert(
      securePool.deposit({ from: user1, value: web3.utils.toWei("5", "ether") }),
      "SphereXEngineMock: malicious tx",
    );

    // Desactivar validación para permitir el depósito
    await sphereXEngine.toggleRevert();

    // Ahora el depósito debería funcionar
    await securePool.deposit({ from: user1, value: web3.utils.toWei("5", "ether") });

    // Activar validación de nuevo
    await sphereXEngine.toggleRevert();

    // Intento de ataque bypass debería fallar, incluso en la función de emergencia
    await expectRevert(
      securePool.emergencyAction(attacker, web3.utils.toWei("5", "ether"), { from: attacker }),
      "SphereXEngineMock: malicious tx",
    );

    // Verificar que los fondos siguen seguros
    const finalPoolBalance = await web3.eth.getBalance(securePool.address);
    assert.equal(finalPoolBalance, web3.utils.toWei("5", "ether"), "Secure pool should still have 5 ETH");
  });
});
