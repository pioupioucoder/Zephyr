// illusion.js – image darkwall.png sur les murs (fond transparent)
import * as THREE from 'three';

export function buildIllusionWorld(scene, camera, canvas) {
    // ─── LUMIÈRES ──────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0x887868, 0.15);
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0x4466aa, 0x1a1a2a, 0.15);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xffe8c0, 0.2);
    sun.position.set(0, 20, -20);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 50;
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0x8899bb, 0.05);
    fill.position.set(-10, 5, 10);
    scene.add(fill);

    // ─── TEXTURES ────────────────────────────────────────────────────
    function makeTex(fn, size) {
        size = size || 128;
        const c = document.createElement('canvas');
        c.width = c.height = size;
        const ctx = c.getContext('2d');
        fn(ctx, size);
        const t = new THREE.CanvasTexture(c);
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        return t;
    }

    const stoneTex = makeTex(function(ctx, s) {
        ctx.fillStyle = '#b8a888';
        ctx.fillRect(0, 0, s, s);
        for (let i = 0; i < 60; i++) {
            const x = Math.random() * s,
                y = Math.random() * s;
            const r = 180 + Math.random() * 40,
                g = 160 + Math.random() * 30,
                b = 130 + Math.random() * 30;
            ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
            ctx.fillRect(x, y, 6 + Math.random() * 14, 6 + Math.random() * 12);
        }
        ctx.strokeStyle = 'rgba(80,70,55,0.12)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < s; i += 20) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, s);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(s, i);
            ctx.stroke();
        }
    }, 128);
    stoneTex.repeat.set(3, 3);

    const floorTex = makeTex(function(ctx, s) {
        ctx.fillStyle = '#4a3828';
        ctx.fillRect(0, 0, s, s);
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                const v = 70 + Math.random() * 30;
                ctx.fillStyle = 'rgb(' + (v + 20) + ',' + (v - 10) + ',' + (v - 30) + ')';
                ctx.fillRect(col * 12 + 1, row * 12 + 1, 10, 10);
            }
        }
        ctx.strokeStyle = 'rgba(0,0,0,0.08)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= s; i += 12) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, s);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(s, i);
            ctx.stroke();
        }
    }, 120);
    floorTex.repeat.set(8, 8);

    const woodTex = makeTex(function(ctx, s) {
        ctx.fillStyle = '#5a3a20';
        ctx.fillRect(0, 0, s, s);
        for (let i = 0; i < s; i += 3) {
            ctx.fillStyle = 'hsl(28,' + (25 + Math.random() * 15) + '%,' + (20 + Math.random() * 12) + '%)';
            ctx.fillRect(0, i, s, 2);
        }
    }, 64);
    woodTex.repeat.set(4, 4);

    // ─── FONCTION POUR LES CHEMINS D'IMAGES ──────────────────────
    function getImagePath(filename) {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return '/projet/Illusion/images/' + filename;
        } else {
            return 'images/' + filename;
        }
    }

    // ─── TEXTURE D'HORREUR (image darkwall.png sur fond noir) ────
    function createHorrorTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Fond noir (transparent pour l'émission)
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(3, 3); // répète pour couvrir tout le mur

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = function() {
            // Effacer en noir
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 10 occurrences aléatoires
            for (let i = 0; i < 10; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const scale = 0.3 + Math.random() * 0.8;
                const angle = Math.random() * Math.PI * 2;
                const w = img.width * scale;
                const h = img.height * scale;

                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(angle);
                if (Math.random() > 0.5) ctx.scale(-1, 1);
                ctx.drawImage(img, -w/2, -h/2, w, h);
                ctx.restore();
            }

            tex.needsUpdate = true;
        };
        img.src = getImagePath('darkwall.png');

        return tex;
    }

    const horrorTex = createHorrorTexture();

    // ─── MATÉRIAUX ──────────────────────────────────────────────────
    const mWall = new THREE.MeshStandardMaterial({
        map: stoneTex,
        color: 0xddd0b8,
        roughness: 0.6,
        metalness: 0.1
    });
    const mFloor = new THREE.MeshLambertMaterial({ map: floorTex, color: 0x6a5848 });
    const mWood = new THREE.MeshLambertMaterial({ map: woodTex, color: 0x7a5a38 });
    const mGlass = new THREE.MeshLambertMaterial({ color: 0x88bbdd, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
    const mCeil = new THREE.MeshLambertMaterial({ color: 0xddd0c0 });
    const mDoor = new THREE.MeshLambertMaterial({ map: woodTex, color: 0x6a4a30 });
    const mHandle = new THREE.MeshLambertMaterial({ color: 0xccaa88 });
    const mDoorFrame = new THREE.MeshLambertMaterial({ color: 0x4a3a2a });
    const mDoorHighlight = new THREE.MeshLambertMaterial({ map: woodTex, color: 0x8a6a50, emissive: 0x442200, emissiveIntensity: 0.3 });

    // ─── HELPERS ──────────────────────────────────────────────────
    function box(w, h, d, mat, x, y, z, rx, ry, rz) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        m.position.set(x, y, z);
        if (rx) m.rotation.x = rx;
        if (ry) m.rotation.y = ry;
        if (rz) m.rotation.z = rz;
        m.castShadow = true;
        m.receiveShadow = true;
        scene.add(m);
        return m;
    }

    function plane(w, h, mat, x, y, z, rx, ry, rz) {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
        m.position.set(x, y, z);
        if (rx) m.rotation.x = rx;
        if (ry) m.rotation.y = ry;
        if (rz) m.rotation.z = rz;
        scene.add(m);
        return m;
    }

    function cylinder(rt, rb, h, seg, mat, x, y, z, rx, ry, rz) {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
        m.position.set(x, y, z);
        if (rx) m.rotation.x = rx;
        if (ry) m.rotation.y = ry;
        if (rz) m.rotation.z = rz;
        m.castShadow = true;
        scene.add(m);
        return m;
    }

    // ─── DIMENSIONS ──────────────────────────────────────────────
    const WALL_H = 3.6;
    const ROOM_W = 16;
    const ROOM_D = 16;
    const HALF_D = ROOM_D / 2;

    // ─── SOL ──────────────────────────────────────────────────────
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(ROOM_W, HALF_D),
        mFloor
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -0.01, HALF_D / 2);
    floor.receiveShadow = true;
    scene.add(floor);

    // ─── MURS EXTÉRIEURS ──────────────────────────────────────────
    plane(ROOM_W, WALL_H, mWall, 0, WALL_H / 2, 0, 0, 0);

    (function() {
        const fw = 2.8, fh = 2.0;
        const doorW = 1.2, doorH = 2.2;
        const doorX = ROOM_W / 2 - 1.8;
        const fz = HALF_D + 0.01;
        const yc = WALL_H / 2;

        box(-fw / 2 - (-ROOM_W / 2), WALL_H, 0.05, mWall, ((-ROOM_W / 2) + (-fw / 2)) / 2, WALL_H / 2, fz);
        const xGap1 = fw / 2, xGap2 = doorX - doorW / 2;
        if (xGap2 > xGap1) {
            const w = xGap2 - xGap1;
            box(w, WALL_H, 0.05, mWall, (xGap1 + xGap2) / 2, WALL_H / 2, fz);
        }
        box(ROOM_W / 2 - (doorX + doorW / 2), WALL_H, 0.05, mWall, (doorX + doorW / 2 + ROOM_W / 2) / 2, WALL_H / 2, fz);

        const yTop = Math.max(yc + fh / 2, doorH);
        if (WALL_H > yTop) {
            box(ROOM_W, WALL_H - yTop, 0.05, mWall, 0, (yTop + WALL_H) / 2, fz);
        }
        const yBotFen = yc - fh / 2;
        if (yBotFen > 0) {
            box(fw, yBotFen - 0, 0.05, mWall, 0, (0 + yBotFen) / 2, fz);
        }
        if (yTop > doorH) {
            box(doorW, yTop - doorH, 0.05, mWall, doorX, (doorH + yTop) / 2, fz);
        }

        const mGlass2 = new THREE.MeshLambertMaterial({ color: 0x88bbdd, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
        plane(fw, fh, mGlass2, 0, yc, fz + 0.01);
        const frameMat = new THREE.MeshLambertMaterial({ color: 0x4a3828 });
        [
            [fw + 0.2, 0.06, 0, fh / 2],
            [fw + 0.2, 0.06, 0, -fh / 2],
            [0.06, fh + 0.2, -fw / 2, 0],
            [0.06, fh + 0.2, fw / 2, 0]
        ].forEach(function(opt) {
            box(opt[0], opt[1], 0.05, frameMat, opt[2], yc + opt[3], fz + 0.02);
        });
        box(fw, 0.04, 0.05, frameMat, 0, yc, fz + 0.02);
        box(0.04, fh, 0.05, frameMat, 0, yc, fz + 0.02);

        const doorZ = HALF_D + 0.02;
        const frameMatDoor = mDoorFrame;
        box(0.08, doorH, 0.08, frameMatDoor, doorX - doorW / 2 - 0.04, doorH / 2 + 0.025, doorZ);
        box(0.08, doorH, 0.08, frameMatDoor, doorX + doorW / 2 + 0.04, doorH / 2 + 0.025, doorZ);
        box(doorW + 0.16, 0.08, 0.08, frameMatDoor, doorX, doorH + 0.025 + 0.04, doorZ);

        // Porte interactive
        const pivot = new THREE.Group();
        pivot.position.set(doorX - doorW / 2, doorH / 2 + 0.025, doorZ);
        scene.add(pivot);

        const doorGroup = new THREE.Group();
        doorGroup.position.set(doorW / 2, 0, 0);
        const doorMesh = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, 0.04), mDoor);
        doorMesh.position.set(0, 0, 0);
        doorMesh.castShadow = true; doorMesh.receiveShadow = true;
        doorGroup.add(doorMesh);
        const handle = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), mHandle);
        handle.position.set(0.35, -0.2, 0.06);
        doorGroup.add(handle);
        const handleBase = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 6), mHandle);
        handleBase.rotation.x = Math.PI / 2;
        handleBase.position.set(0.35, -0.2, 0.04);
        doorGroup.add(handleBase);

        const clickArea = new THREE.Mesh(new THREE.PlaneGeometry(doorW * 1.2, doorH * 1.2),
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide }));
        clickArea.position.set(0, 0, 0.02);
        clickArea.userData.isClickArea = true;
        doorGroup.add(clickArea);
        pivot.add(doorGroup);

        window._doorPivot = pivot;
        window._doorGroup = doorGroup;
        window._doorMesh = doorMesh;
        window._doorMat = mDoor;
        window._doorHighlightMat = mDoorHighlight;
        window._doorOpen = false;
        window._doorAnimating = false;
        window._doorData = {
            localX: doorX,
            localZ: doorZ,
            halfWidth: doorW / 2,
            isOpen: false
        };
    })();

    // Murs latéraux
    plane(HALF_D, WALL_H, mWall, -ROOM_W / 2, WALL_H / 2, HALF_D / 2, 0, Math.PI / 2);
    plane(HALF_D, WALL_H, mWall, ROOM_W / 2, WALL_H / 2, HALF_D / 2, 0, -Math.PI / 2);

    // ─── PLAFOND ─────────────────────────────────────────────────
    plane(ROOM_W, HALF_D, mCeil, 0, WALL_H, HALF_D / 2, Math.PI / 2);

    // ─── PLINTHES ────────────────────────────────────────────────
    const mBaseboard = new THREE.MeshStandardMaterial({ color: 0x6a1a1a, roughness: 0.7 });
    const baseH = 0.12;
    const baseDepth = 0.03;
    box(ROOM_W, baseH, baseDepth, mBaseboard, 0, baseH / 2, 0.02);
    box(ROOM_W, baseH, baseDepth, mBaseboard, 0, baseH / 2, HALF_D - 0.02);
    box(baseDepth, baseH, HALF_D, mBaseboard, -ROOM_W / 2 + 0.02, baseH / 2, HALF_D / 2);
    box(baseDepth, baseH, HALF_D, mBaseboard, ROOM_W / 2 - 0.02, baseH / 2, HALF_D / 2);

    // ─── COLLISION MUR INTÉRIEUR ────────────────────────────────
    const wallCollider = new THREE.Mesh(
        new THREE.BoxGeometry(ROOM_W, WALL_H, 0.05),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide })
    );
    wallCollider.position.set(0, WALL_H / 2, 0);
    wallCollider.userData.isWall = true;
    wallCollider.userData.collisionType = 'wall';
    wallCollider.name = 'wallCollider';
    scene.add(wallCollider);

    // ─── LAMPE MODERNE – ALLUMÉE PAR DÉFAUT ──────────────────────
    const lampConfigs = [
        {
            id: 'right',
            position: new THREE.Vector3(0, 2.8, 4),
            color: 0xffeedd,
            intensity: 2.0,
            range: 12,
            switchPos: new THREE.Vector3(7.85, 1.0, 4),
            switchAngle: -Math.PI / 2
        }
    ];

    const lampStates = {};
    const lampMeshes = {};
    const switchMeshes = [];

    lampConfigs.forEach((cfg) => {
        const group = new THREE.Group();
        group.position.copy(cfg.position);

        const headMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, metalness: 0.8, roughness: 0.2 });
        const head = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.15, 8), headMat);
        head.position.y = 0;
        head.rotation.x = Math.PI;
        group.add(head);

        const bulbMat = new THREE.MeshStandardMaterial({
            color: cfg.color,
            emissive: cfg.color,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.9
        });
        bulbMat.color.setHex(cfg.color);
        bulbMat.emissive.setHex(cfg.color);
        bulbMat.emissiveIntensity = 0.8;

        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), bulbMat);
        bulb.position.y = -0.15;
        group.add(bulb);

        const light = new THREE.PointLight(cfg.color, cfg.intensity, cfg.range);
        light.position.copy(cfg.position);
        light.position.y -= 0.15;
        light.intensity = cfg.intensity;
        scene.add(light);

        const cableMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.8, 4), cableMat);
        cable.position.y = 0.4;
        group.add(cable);

        scene.add(group);

        lampStates[cfg.id] = true;
        lampMeshes[cfg.id] = {
            light: light,
            bulbMat: bulbMat,
            originalIntensity: cfg.intensity,
            color: cfg.color
        };

        const switchGroup = new THREE.Group();
        switchGroup.position.copy(cfg.switchPos);

        const plateMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.3, metalness: 0.2 });
        const plate = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 0.04), plateMat);
        plate.position.set(0, 0, 0);
        switchGroup.add(plate);

        const btnMat = new THREE.MeshStandardMaterial({
            color: 0x44aa44,
            emissive: 0x44aa44,
            emissiveIntensity: 0.2,
            roughness: 0.4
        });
        const btn = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.02), btnMat);
        btn.position.set(0, 0, 0.03);
        btn.userData.isSwitch = true;
        btn.userData.lampId = cfg.id;
        btn.userData.defaultColor = 0x44aa44;
        btn.userData.hoverColor = 0x88ff88;
        switchGroup.add(btn);

        switchGroup.rotation.y = cfg.switchAngle;
        scene.add(switchGroup);

        switchMeshes.push(btn);
    });

    // ─── INTERACTIONS DE L'INTERRUPTEUR ──────────────────────────
    function setupSwitchInteractions() {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let hoveredSwitch = null;

        canvas.addEventListener('mousemove', (event) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);

            const intersects = raycaster.intersectObjects(switchMeshes);
            let newHover = null;
            if (intersects.length > 0) {
                newHover = intersects[0].object;
                canvas.style.cursor = 'pointer';
            } else {
                canvas.style.cursor = 'default';
            }

            if (newHover !== hoveredSwitch) {
                if (hoveredSwitch) {
                    const isOn = lampStates[hoveredSwitch.userData.lampId];
                    const defaultColor = isOn ? 0x44aa44 : 0xaa4444;
                    hoveredSwitch.material.color.setHex(defaultColor);
                    hoveredSwitch.material.emissive.setHex(isOn ? 0x44aa44 : 0x000000);
                    hoveredSwitch.material.emissiveIntensity = isOn ? 0.2 : 0;
                }
                if (newHover) {
                    newHover.material.color.setHex(0x88ff88);
                    newHover.material.emissive.setHex(0xffff88);
                    newHover.material.emissiveIntensity = 0.3;
                }
                hoveredSwitch = newHover;
            }
        });

        canvas.addEventListener('click', (event) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);

            const intersects = raycaster.intersectObjects(switchMeshes);
            if (intersects.length === 0) {
                console.log('Aucun interrupteur détecté sous le curseur');
                return;
            }

            const clickedSwitch = intersects[0].object;
            if (!clickedSwitch.userData.isSwitch) return;

            const lampId = clickedSwitch.userData.lampId;
            lampStates[lampId] = !lampStates[lampId];
            const data = lampMeshes[lampId];

            if (lampStates[lampId]) {
                // ALLUMÉ
                console.log('💡 Lumière allumée');
                mWall.emissiveMap = null;
                mWall.emissive.setHex(0x000000);
                mWall.emissiveIntensity = 0;
                mWall.needsUpdate = true;

                data.light.intensity = data.originalIntensity;
                data.bulbMat.color.setHex(data.color);
                data.bulbMat.emissive.setHex(data.color);
                data.bulbMat.emissiveIntensity = 0.8;

                clickedSwitch.material.color.setHex(0x44aa44);
                clickedSwitch.userData.defaultColor = 0x44aa44;
                clickedSwitch.material.emissive.setHex(0x44aa44);
                clickedSwitch.material.emissiveIntensity = 0.2;
            } else {
                // ÉTEINT – on active l'horreur
                console.log('💀 Lumière éteinte – horreur activée');
                mWall.emissiveMap = horrorTex;
                // On met du blanc pour que la couleur de la texture s'affiche
                mWall.emissive.setHex(0xffffff);
                mWall.emissiveIntensity = 1.5;
                mWall.needsUpdate = true;

                data.light.intensity = 0;
                data.bulbMat.color.setHex(0x444444);
                data.bulbMat.emissive.setHex(0x444444);
                data.bulbMat.emissiveIntensity = 0;

                clickedSwitch.material.color.setHex(0xaa4444);
                clickedSwitch.userData.defaultColor = 0xaa4444;
                clickedSwitch.material.emissive.setHex(0x000000);
                clickedSwitch.material.emissiveIntensity = 0;
            }
        });
    }

    setupSwitchInteractions();

    // ─── LIT ──────────────────────────────────────────────────────
    function createBed() {
        const group = new THREE.Group();
        const E = 1.1, W = 0;

        function createPatternTexture(colors, stripeWidth, bgColor) {
            const c = document.createElement('canvas');
            c.width = 256; c.height = 256;
            const ctx = c.getContext('2d');
            ctx.fillStyle = bgColor || '#f0e0d0';
            ctx.fillRect(0, 0, 256, 256);
            ctx.save();
            ctx.translate(128, 128);
            ctx.rotate(0.4);
            for (let i = -300; i < 300; i += 20) {
                ctx.fillStyle = colors[i % colors.length];
                ctx.fillRect(i, -300, stripeWidth || 8, 600);
            }
            ctx.restore();
            for (let i = 0; i < 80; i++) {
                ctx.fillStyle = colors[(i + 3) % colors.length];
                ctx.beginPath();
                ctx.arc(20 + Math.random() * 216, 20 + Math.random() * 216, 6 + Math.random() * 8, 0, Math.PI * 2);
                ctx.fill();
            }
            const t = new THREE.CanvasTexture(c);
            t.wrapS = t.wrapT = THREE.RepeatWrapping;
            t.repeat.set(2, 2);
            return t;
        }
        const blanketColors = ['#e8a0b0', '#d08090', '#f0c0c8', '#c06070'];
        const blanketTex = createPatternTexture(blanketColors, 10, '#f5e0e0');

        const frameMat = new THREE.MeshLambertMaterial({ color: 0xd4b090 });
        const legMat = new THREE.MeshLambertMaterial({ color: 0xb09070 });
        const halfW = 0.6 + W/2;
        const legs = [
            [-halfW, -0.8], [halfW, -0.8],
            [-halfW, 0.8 + E], [halfW, 0.8 + E]
        ];
        legs.forEach(([x, z]) => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.4, 6), legMat);
            leg.position.set(x, 0.2, z);
            leg.castShadow = true;
            group.add(leg);
        });

        const longSide = new THREE.Mesh(new THREE.BoxGeometry(1.2 + W, 0.08, 0.08), frameMat);
        longSide.position.set(0, 0.4, -0.8); group.add(longSide);
        const longSide2 = new THREE.Mesh(new THREE.BoxGeometry(1.2 + W, 0.08, 0.08), frameMat);
        longSide2.position.set(0, 0.4, 0.8 + E); group.add(longSide2);
        const shortSide = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.6 + E), frameMat);
        shortSide.position.set(-halfW, 0.4, E/2); group.add(shortSide);
        const shortSide2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.6 + E), frameMat);
        shortSide2.position.set(halfW, 0.4, E/2); group.add(shortSide2);

        const headMat = new THREE.MeshLambertMaterial({ color: 0xe0c0b0 });
        const head = new THREE.Mesh(new THREE.BoxGeometry(1.2 + W, 0.6, 0.08), headMat);
        head.position.set(0, 0.9, -0.85); group.add(head);
        const paddingMat = new THREE.MeshLambertMaterial({ color: 0xf0d8c8 });
        const pad = new THREE.Mesh(new THREE.BoxGeometry(1.1 + W, 0.5, 0.06), paddingMat);
        pad.position.set(0, 0.9, -0.89); group.add(pad);

        const btnMat = new THREE.MeshLambertMaterial({ color: 0xc09080 });
        const btnSpacingX = (0.4 + W/2) / 2;
        for (let i = -btnSpacingX; i <= btnSpacingX + 0.01; i += btnSpacingX) {
            for (let j = -0.15; j <= 0.15; j += 0.15) {
                const btn = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), btnMat);
                btn.position.set(i, 0.9 + j, -0.88);
                group.add(btn);
            }
        }

        const mattressMat = new THREE.MeshLambertMaterial({ color: 0xf8f0e8 });
        const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.2 + W, 0.2, 1.6 + E), mattressMat);
        mattress.position.set(0, 0.5, E/2);
        mattress.castShadow = true; mattress.receiveShadow = true;
        group.add(mattress);

        const pillowMat = new THREE.MeshLambertMaterial({ color: 0xf0e8e0 });
        const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.6 + W*0.5, 0.12, 0.4), pillowMat);
        pillow.position.set(0, 0.7, -0.2);
        pillow.castShadow = true; pillow.receiveShadow = true;
        group.add(pillow);
        const pillowTop = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), pillowMat);
        pillowTop.scale.set(0.9 + W*0.4, 0.3, 0.7);
        pillowTop.position.set(0, 0.76, -0.2);
        pillowTop.castShadow = true;
        group.add(pillowTop);

        const blanketMat = new THREE.MeshLambertMaterial({ map: blanketTex, color: 0xf0e0e0 });
        const blanket = new THREE.Mesh(new THREE.BoxGeometry(1.1 + W, 0.04, 1.1 + E), blanketMat);
        blanket.position.set(0, 0.62, 0.25 + E/2);
        blanket.castShadow = true; blanket.receiveShadow = true;
        group.add(blanket);
        const foldMat = new THREE.MeshLambertMaterial({ map: blanketTex, color: 0xe8c8c8 });
        const fold = new THREE.Mesh(new THREE.BoxGeometry(1.1 + W, 0.04, 0.15), foldMat);
        fold.position.set(0, 0.63, 0.7 + E);
        group.add(fold);
        const edgeMat = new THREE.MeshLambertMaterial({ color: 0xd08090 });
        const edge = new THREE.Mesh(new THREE.BoxGeometry(1.1 + W, 0.02, 0.04), edgeMat);
        edge.position.set(0, 0.64, 0.7 + E);
        group.add(edge);

        group.position.set(-7, 0, 0.8);
        group.rotation.y = Math.PI / 2;
        scene.add(group);
        window._bedPosition = group.position.clone();
    }
    createBed();

    // ================================================================
    // ========== LIVRES – NOUVELLE VERSION GRANDE ET RÉALISTE ==========
    // ================================================================
    const BOOKS_DATA = [
        {
            id: 'Your_Words_That_I_Never_Heard',
            title: 'Your Words That I Never Heard',
            chapter: 'A Cold Morning',
            jsonUrl: 'Your_Words_That_I_Never_Heard.json',
            color: 0x1a3a5a
        },
         {
    id: 'Throughout_The_Evening',
    title: 'Throughout The Evening',
    chapter: 'One-shot',
    jsonUrl: 'Throughout_The_Evening.json',
    color: 0x6a2a2a   // vous pouvez ajuster la couleur
  },
         {
    id: 'The_Stars_For_The_Night_Sky',
    title: 'The Stars for the Night Sky',
    chapter: 'Poème',
    jsonUrl: 'The_Stars_For_The_Night_Sky.json',
    color: 0x3a6a3a   // vous pouvez ajuster
  }
];

    // ─── BIBLIOTHÈQUE ──────────────────────────────────────────
    function createBookshelf() {
        const group = new THREE.Group();
        window._bibliotheque = group;
        const width = 2.0,
            height = 2.4,
            depth = 0.5;
        const shelfThick = 0.05,
            legThick = 0.06;
        const woodMat = new THREE.MeshStandardMaterial({ color: 0xd4b090, roughness: 0.4, metalness: 0.1 });
        const metalMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.3, metalness: 0.8 });
        const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x8a6e4b, roughness: 0.5, metalness: 0.1 });

        const legPositions = [
            [-width / 2 + 0.06, -depth / 2 + 0.06],
            [width / 2 - 0.06, -depth / 2 + 0.06],
            [-width / 2 + 0.06, depth / 2 - 0.06],
            [width / 2 - 0.06, depth / 2 - 0.06]
        ];
        legPositions.forEach(([x, z]) => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(legThick, height, legThick), metalMat);
            leg.position.set(x, height / 2, z);
            leg.castShadow = true;
            leg.receiveShadow = true;
            group.add(leg);
        });

        const nbShelves = 6;
        const spacing = height / (nbShelves + 1);
        const etageres = [];
        for (let i = 1; i <= nbShelves; i++) {
            const yPos = i * spacing - 0.05;
            etageres.push(yPos);
            const mat = (i % 2 === 0) ? woodMat : darkWoodMat;
            const shelf = new THREE.Mesh(new THREE.BoxGeometry(width - 0.04, shelfThick, depth - 0.04), mat);
            shelf.position.set(0, yPos, 0);
            shelf.castShadow = true;
            shelf.receiveShadow = true;
            group.add(shelf);
        }

        const top = new THREE.Mesh(new THREE.BoxGeometry(width + 0.02, 0.05, depth + 0.02), woodMat);
        top.position.set(0, height, 0);
        top.castShadow = true;
        top.receiveShadow = true;
        group.add(top);

        const base = new THREE.Mesh(new THREE.BoxGeometry(width - 0.02, 0.04, depth - 0.02), metalMat);
        base.position.set(0, 0.02, 0);
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);

        group.userData.etageres = etageres;
        group.position.set(7.7, 0, 2);
        group.rotation.y = Math.PI / 2;
        scene.add(group);
        window._bookshelfPosition = group.position.clone();

        const shelfIndex = 2;
        const shelfY = etageres[shelfIndex];
        const startX = -width / 2 + 0.12;
        const spacingX = 0.22;
        BOOKS_DATA.forEach((bookData, index) => {
            const x = startX + index * spacingX;
            addBookToShelf(bookData, group, shelfY, x);
        });
    }

    // ─── CRÉATION D'UN GRAND LIVRE RÉALISTE ──────────────────────
    function createBook3D(title, chapter, color) {
        const group = new THREE.Group();

        const height = 0.25;
        const width = 0.06;
        const depth = 0.3;

        function createCoverTexture(title, chapter) {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');

            const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            grad.addColorStop(0, '#5a3a2a');
            grad.addColorStop(1, '#2a1a10');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = '#d4a840';
            ctx.lineWidth = 14;
            ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

            ctx.fillStyle = '#f5e6c8';
            ctx.font = 'bold 64px "Georgia", serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(title, canvas.width/2, 70);

            ctx.strokeStyle = '#d4a840';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(60, 200);
            ctx.lineTo(canvas.width - 60, 200);
            ctx.stroke();

            ctx.fillStyle = '#e8d5b0';
            ctx.font = '42px "Georgia", serif';
            ctx.textBaseline = 'top';
            ctx.fillText('Chapitre :', canvas.width/2, 230);
            ctx.font = 'bold 52px "Georgia", serif';
            ctx.fillStyle = '#f5e6c8';
            ctx.fillText(chapter, canvas.width/2, 290);

            ctx.fillStyle = '#d4a840';
            ctx.font = '70px serif';
            ctx.textBaseline = 'bottom';
            ctx.fillText('✦', canvas.width/2, canvas.height - 30);

            return new THREE.CanvasTexture(canvas);
        }

        const coverTex = createCoverTexture(title, chapter);
        const coverMat = new THREE.MeshStandardMaterial({
            map: coverTex,
            roughness: 0.5,
            metalness: 0.1,
            side: THREE.DoubleSide
        });

        const pagesMat = new THREE.MeshStandardMaterial({
            color: 0xf5f0e8,
            roughness: 0.9
        });
        const pages = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            pagesMat
        );
        pages.position.set(0, 0, 0);
        pages.castShadow = true;
        pages.receiveShadow = true;
        group.add(pages);

        const cover = new THREE.Mesh(
            new THREE.PlaneGeometry(width, height),
            coverMat
        );
        cover.position.set(0, 0, depth/2 + 0.002);
        cover.castShadow = true;
        cover.receiveShadow = true;
        group.add(cover);

        const spineMat = new THREE.MeshStandardMaterial({
            color: 0x3a2218,
            roughness: 0.8
        });
        const spine = new THREE.Mesh(
            new THREE.PlaneGeometry(width, height),
            spineMat
        );
        spine.position.set(0, 0, -depth/2 - 0.002);
        spine.rotation.y = Math.PI;
        spine.castShadow = true;
        spine.receiveShadow = true;
        group.add(spine);

        const edgeMat = new THREE.MeshStandardMaterial({
            color: 0xe8dcc8,
            roughness: 0.8
        });
        const edgePos = new THREE.Mesh(
            new THREE.PlaneGeometry(depth, height),
            edgeMat
        );
        edgePos.position.set(width/2 + 0.002, 0, 0);
        edgePos.rotation.y = Math.PI/2;
        edgePos.castShadow = true;
        edgePos.receiveShadow = true;
        group.add(edgePos);

        const edgeNeg = new THREE.Mesh(
            new THREE.PlaneGeometry(depth, height),
            edgeMat
        );
        edgeNeg.position.set(-width/2 - 0.002, 0, 0);
        edgeNeg.rotation.y = -Math.PI/2;
        edgeNeg.castShadow = true;
        edgeNeg.receiveShadow = true;
        group.add(edgeNeg);

        const clickArea = new THREE.Mesh(
            new THREE.PlaneGeometry(width * 0.9, height * 0.9),
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide })
        );
        clickArea.position.set(0, 0, depth/2 + 0.003);
        clickArea.userData.isClickArea = true;
        group.add(clickArea);

        group.userData.estLivre = true;
        group.userData.coverMat = coverMat;
        group.userData.originalColor = color;
        group.userData.hoverColor = 0xcc8844;

        return group;
    }

    // ─── AJOUT D'UN LIVRE SUR L'ÉTAGÈRE ─────────────────────────
    function addBookToShelf(bookData, shelfGroup, shelfY, xPos) {
        const book = createBook3D(bookData.title, bookData.chapter, bookData.color);
        book.rotation.y = Math.PI;
        const height = 0.25;
        book.position.set(xPos, shelfY + height/2 + 0.01, -0.12);
        book.castShadow = true;
        book.receiveShadow = true;

        book.userData.jsonUrl = bookData.jsonUrl;
        book.userData.title = bookData.title;
        shelfGroup.add(book);

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let hover = false;

        function onMouseMove(event) {
            const rect = canvas.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(book.children, true);
            if (intersects.length > 0) {
                if (!hover) {
                    hover = true;
                    book.userData.coverMat.color.setHex(book.userData.hoverColor);
                    canvas.style.cursor = 'pointer';
                }
            } else {
                if (hover) {
                    hover = false;
                    book.userData.coverMat.color.setHex(book.userData.originalColor);
                    canvas.style.cursor = 'default';
                }
            }
        }

        function onMouseClick(event) {
            const rect = canvas.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(book.children, true);
            if (intersects.length > 0) {
                const url = book.userData.jsonUrl;
                const title = book.userData.title || url.replace('.json', '');
                openBookWithURL(url, title);
                event.stopPropagation();
            }
        }

        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('click', onMouseClick);
        book.userData._cleanup = function() {
            canvas.removeEventListener('mousemove', onMouseMove);
            canvas.removeEventListener('click', onMouseClick);
        };
    }

    // ─── OUVERTURE D'UN LIVRE (MODALE) ──────────────────────────
    function openBookWithURL(url, title) {
        let modal = document.getElementById('modalLivre');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalLivre';
            modal.style.cssText = `
                position: fixed; top:50%; left:50%; transform:translate(-50%,-50%);
                width:70%; max-width:800px; height:80%;
                background: #f5f0eb; border-radius:12px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.5); padding:20px; z-index:1000;
                display:none; flex-direction:column; font-family: 'Georgia', serif;
            `;
            document.body.appendChild(modal);
        }
        modal.innerHTML = '';
        modal.style.display = 'flex';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            position: absolute; top:10px; right:20px; font-size:28px;
            background:none; border:none; cursor:pointer; color:#333;
        `;
        closeBtn.onclick = () => { modal.style.display = 'none'; };
        modal.appendChild(closeBtn);

        const titre = document.createElement('h2');
        titre.textContent = '📖 ' + (title || url.replace('.json', ''));
        titre.style.marginTop = '0';
        modal.appendChild(titre);

        const contentDiv = document.createElement('div');
        contentDiv.id = 'contenuLivre';
        contentDiv.style.cssText = `
            flex:1; overflow-y:auto; margin-top:10px;
            display:flex; flex-direction:column; gap:15px;
        `;
        modal.appendChild(contentDiv);

        chargerContenuLivre(contentDiv, url);
    }

    // ─── CHARGEMENT DU JSON AVEC PAGINATION AUTOMATIQUE ──────────
    function chargerContenuLivre(container, jsonUrl) {
        const hostname = window.location.hostname;
        let fullUrl;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            fullUrl = '/projet/Illusion/livres/' + jsonUrl;
        } else {
            fullUrl = 'livres/' + jsonUrl;
        }

        fetch(fullUrl)
            .then(response => {
                if (!response.ok) throw new Error('HTTP ' + response.status);
                return response.json();
            })
            .then(data => {
                if (data.chapitres) {
                    data.chapitres = data.chapitres.map(chap => {
                        if (Array.isArray(chap.pages)) {
                            if (chap.pages.length === 1 && chap.pages[0].includes('\n')) {
                                chap.pages = chap.pages[0].split('\n').filter(p => p.trim() !== '');
                            }
                        } else if (typeof chap.pages === 'string') {
                            chap.pages = chap.pages.split('\n').filter(p => p.trim() !== '');
                        }
                        return chap;
                    });
                    afficherLivre(container, data);
                } else if (data.pages) {
                    let pagesArray = data.pages.map(p => p.contenu || p);
                    if (pagesArray.length === 1 && pagesArray[0].includes('\n')) {
                        pagesArray = pagesArray[0].split('\n').filter(p => p.trim() !== '');
                    }
                    const chapitres = [{
                        titre: 'Contenu',
                        pages: pagesArray
                    }];
                    afficherLivre(container, { chapitres });
                } else {
                    afficherLivre(container, {
                        chapitres: [{ titre: 'Erreur', pages: ['Structure JSON invalide.'] }]
                    });
                }
            })
            .catch(err => {
                console.error('❌ Erreur chargement JSON:', err);
                afficherLivre(container, {
                    chapitres: [
                        { titre: '📖 Fichier introuvable', pages: [
                            'Le fichier ' + jsonUrl + ' n\'a pas été trouvé.',
                            'Vérifie son emplacement (dossier "livres/") ou crée-le.',
                            'Structure attendue : { "chapitres": [ { "titre": "...", "pages": ["..."] } ] }'
                        ]}
                    ]
                });
            });
    }

    // ─── AFFICHAGE D'UN LIVRE (UNE SEULE PAGE À LA FOIS) ──────────
    function afficherLivre(container, bookData) {
        const chapitres = bookData.chapitres;
        if (!chapitres || chapitres.length === 0) {
            container.innerHTML = '<p style="color:red;">Aucun chapitre trouvé.</p>';
            return;
        }
        let currentChapterIndex = 0;
        let currentPageIndex = 0;

        function render() {
            container.innerHTML = '';
            container.style.cssText = `
                display: flex; flex-direction: column; align-items: center;
                background: #f5f0eb; border-radius: 12px; padding: 20px;
                min-height: 400px; box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                font-family: 'Georgia', serif; position: relative;
            `;

            const chap = chapitres[currentChapterIndex];
            const pages = chap.pages;
            const totalPages = pages.length;

            let leftPageIndex = currentPageIndex;
            let rightPageIndex = currentPageIndex + 1;
            const hasRightPage = rightPageIndex < totalPages;

            const header = document.createElement('div');
            header.style.cssText = `
                width: 100%; display: flex; justify-content: space-between;
                align-items: center; margin-bottom: 15px; padding-bottom: 10px;
                border-bottom: 1px solid #ddd; font-size: 14px; color: #6a5a4a;
            `;
            const chapTitle = document.createElement('span');
            chapTitle.textContent = `📖 ${chap.titre}`;
            chapTitle.style.fontWeight = 'bold';
            const pageInfo = document.createElement('span');
            pageInfo.textContent = `Pages ${leftPageIndex + 1}${hasRightPage ? ' – ' + (rightPageIndex + 1) : ''} / ${totalPages}`;
            const chapNav = document.createElement('span');
            chapNav.textContent = `Chapitre ${currentChapterIndex + 1} / ${chapitres.length}`;
            chapNav.style.fontStyle = 'italic';
            header.appendChild(chapTitle);
            header.appendChild(pageInfo);
            header.appendChild(chapNav);
            container.appendChild(header);

            const bookBody = document.createElement('div');
            bookBody.style.cssText = `
                display: flex; gap: 0; width: 100%; flex: 1;
                min-height: 300px; background: #fcf9f6; border-radius: 8px;
                padding: 15px; box-shadow: inset 0 0 20px rgba(0,0,0,0.05);
                position: relative;
            `;

            const leftPageDiv = createPageElement(pages[leftPageIndex], leftPageIndex + 1);
            leftPageDiv.style.flex = '1';
            leftPageDiv.style.borderRight = 'none';
            bookBody.appendChild(leftPageDiv);

            const separator = document.createElement('div');
            separator.style.cssText = `
                width: 4px;
                background: linear-gradient(to bottom, #d4c8b8, #b8a898, #d4c8b8);
                flex-shrink: 0;
                margin: 10px 0;
                box-shadow: -2px 0 8px rgba(0,0,0,0.08), 2px 0 8px rgba(0,0,0,0.08);
                border-radius: 2px;
            `;
            bookBody.appendChild(separator);

            if (hasRightPage) {
                const rightPageDiv = createPageElement(pages[rightPageIndex], rightPageIndex + 1);
                rightPageDiv.style.flex = '1';
                rightPageDiv.style.borderLeft = 'none';
                bookBody.appendChild(rightPageDiv);
            } else {
                const emptyPage = document.createElement('div');
                emptyPage.style.cssText = `
                    flex: 1; display: flex; align-items: center; justify-content: center;
                    color: #aaa; font-style: italic; font-size: 16px; padding: 20px;
                    background: #fcf9f6; border-radius: 4px;
                    min-height: 200px;
                `;
                emptyPage.textContent = '✨ Fin du chapitre';
                bookBody.appendChild(emptyPage);
            }

            container.appendChild(bookBody);

            const nav = document.createElement('div');
            nav.style.cssText = `
                display: flex; gap: 15px; margin-top: 18px; align-items: center;
                width: 100%; justify-content: center; flex-wrap: wrap;
            `;

            const btnPrev = createNavButton('◀ Page précédente', () => {
                if (currentPageIndex > 0) {
                    currentPageIndex -= 2;
                    if (currentPageIndex < 0) currentPageIndex = 0;
                    render();
                } else if (currentChapterIndex > 0) {
                    currentChapterIndex--;
                    const prevChap = chapitres[currentChapterIndex];
                    let lastPage = prevChap.pages.length - 1;
                    if (lastPage % 2 === 0) lastPage--;
                    if (lastPage < 0) lastPage = 0;
                    currentPageIndex = lastPage;
                    render();
                }
            }, currentPageIndex > 0 || currentChapterIndex > 0);

            const btnNext = createNavButton('Page suivante ▶', () => {
                if (hasRightPage && rightPageIndex < totalPages - 1) {
                    currentPageIndex += 2;
                    render();
                } else if (hasRightPage && rightPageIndex === totalPages - 1) {
                    if (currentChapterIndex < chapitres.length - 1) {
                        currentChapterIndex++;
                        currentPageIndex = 0;
                        render();
                    }
                } else if (!hasRightPage) {
                    if (currentChapterIndex < chapitres.length - 1) {
                        currentChapterIndex++;
                        currentPageIndex = 0;
                        render();
                    }
                }
            }, currentPageIndex < totalPages - 1 || currentChapterIndex < chapitres.length - 1);

            const progress = document.createElement('span');
            progress.textContent = `Pages ${leftPageIndex + 1}${hasRightPage ? ' – ' + (rightPageIndex + 1) : ''} / ${totalPages} (Chap. ${currentChapterIndex + 1})`;
            progress.style.cssText = `
                font-size: 13px; color: #8a7a6a; padding: 4px 12px;
                background: #ede8e0; border-radius: 20px;
            `;

            nav.appendChild(btnPrev);
            nav.appendChild(progress);
            nav.appendChild(btnNext);
            container.appendChild(nav);
        }

        function createPageElement(text, pageNum) {
            const div = document.createElement('div');
            div.style.cssText = `
                flex: 1; padding: 20px 24px; background: #fcf9f6; border-radius: 4px;
                line-height: 2; font-size: 16px; color: #2c2c2c; min-height: 200px;
                max-height: 400px; overflow-y: auto; border: 1px solid #ede8e0;
                box-shadow: 0 2px 4px rgba(0,0,0,0.02); position: relative;
                margin: 4px;
            `;
            const num = document.createElement('span');
            num.textContent = pageNum;
            num.style.cssText = `
                position: absolute; bottom: 8px; right: 12px; font-size: 12px;
                color: #d0c8b8; font-style: italic;
            `;
            div.appendChild(num);
            const content = document.createElement('div');
            content.textContent = text;
            content.style.cssText = `
                white-space: pre-wrap; word-break: break-word;
                font-family: 'Georgia', serif; font-size: 16px; line-height: 1.9;
                color: #2c2c2c; min-height: 160px;
            `;
            div.appendChild(content);
            const lines = document.createElement('div');
            lines.style.cssText = `
                position: absolute; top: 0; left: 20px; right: 20px; bottom: 0;
                pointer-events: none; opacity: 0.08;
                background: repeating-linear-gradient(to bottom, transparent, transparent 28px, #b8a898 28px, #b8a898 29px);
            `;
            div.appendChild(lines);
            return div;
        }

        function createNavButton(label, onClick, enabled) {
            const btn = document.createElement('button');
            btn.textContent = label;
            btn.style.cssText = `
                padding: 8px 18px; border: none; border-radius: 24px;
                background: ${enabled ? '#8a7a6a' : '#ccc'};
                color: white; font-family: 'Georgia', serif; font-size: 14px;
                cursor: ${enabled ? 'pointer' : 'default'}; transition: 0.2s;
                box-shadow: 0 2px 6px rgba(0,0,0,0.08);
            `;
            if (enabled) {
                btn.onmouseover = () => { btn.style.background = '#6a5a4a'; };
                btn.onmouseout = () => { btn.style.background = '#8a7a6a'; };
                btn.onclick = onClick;
            } else {
                btn.style.opacity = '0.5';
            }
            return btn;
        }

        render();
    }

    // ─── CRÉATION DE LA BIBLIOTHÈQUE ──────────────────────────────
    createBookshelf();

    // ─── CADRES AVEC IMAGES ──────────────────────────────────────
    function generateFallbackTexture() {
        const canvas2 = document.createElement('canvas');
        canvas2.width = 256;
        canvas2.height = 256;
        const ctx = canvas2.getContext('2d');
        const grad = ctx.createLinearGradient(0, 0, 256, 256);
        grad.addColorStop(0, '#8a7a5a');
        grad.addColorStop(1, '#5a4a2a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);
        ctx.strokeStyle = '#d4a840';
        ctx.lineWidth = 12;
        ctx.strokeRect(20, 20, 216, 216);
        ctx.fillStyle = '#d4a840';
        ctx.font = '80px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🎨', 128, 130);
        return new THREE.CanvasTexture(canvas2);
    }

    function createFrame(posX, posY, posZ, rotY, imageIndex) {
        const frameW = 0.8, frameH = 1.0, borderW = 0.02, depth = 0.12;
        const group = new THREE.Group();
        group.position.set(posX, posY, posZ);
        group.rotation.y = rotY;

        const imgMat = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            polygonOffset: true,
            polygonOffsetFactor: -1,
            polygonOffsetUnits: -1
        });
        const imageMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(frameW - borderW * 2.4, frameH - borderW * 2.4),
            imgMat
        );
        imageMesh.position.set(0, 0, depth * 0.2);
        group.add(imageMesh);

        const imgUrl = 'images/corridor' + imageIndex + '.png';
        const loader = new THREE.TextureLoader();
        loader.load(imgUrl, function(tex) {
            imageMesh.material = new THREE.MeshLambertMaterial({
                map: tex,
                polygonOffset: true,
                polygonOffsetFactor: -1,
                polygonOffsetUnits: -1
            });
            imageMesh.material.needsUpdate = true;
        }, undefined, function() {
            const fallbacks = ['images/corridor' + imageIndex + '.jpg', 'images/corridor' + imageIndex + '.webp'];
            let tried = 0;
            function tryFallback() {
                if (tried >= fallbacks.length) {
                    imageMesh.material = new THREE.MeshLambertMaterial({
                        map: generateFallbackTexture(),
                        polygonOffset: true,
                        polygonOffsetFactor: -1,
                        polygonOffsetUnits: -1
                    });
                    return;
                }
                const fLoader = new THREE.TextureLoader();
                fLoader.load(fallbacks[tried], function(tex) {
                    imageMesh.material = new THREE.MeshLambertMaterial({
                        map: tex,
                        polygonOffset: true,
                        polygonOffsetFactor: -1,
                        polygonOffsetUnits: -1
                    });
                    imageMesh.material.needsUpdate = true;
                }, undefined, function() {
                    tried++;
                    tryFallback();
                });
            }
            tryFallback();
        });

        const bMat = new THREE.MeshLambertMaterial({ color: 0xb89040, emissive: 0x2a1a00, emissiveIntensity: 0.15 });
        const top = new THREE.Mesh(new THREE.BoxGeometry(frameW + 0.04, borderW, depth * 0.8), bMat);
        top.position.set(0, frameH / 2 - borderW / 2, 0);
        group.add(top);
        const bot = new THREE.Mesh(new THREE.BoxGeometry(frameW + 0.04, borderW, depth * 0.8), bMat);
        bot.position.set(0, -frameH / 2 + borderW / 2, 0);
        group.add(bot);
        const left = new THREE.Mesh(new THREE.BoxGeometry(borderW, frameH - borderW * 2, depth * 0.8), bMat);
        left.position.set(-frameW / 2 + borderW / 2, 0, 0);
        group.add(left);
        const right = new THREE.Mesh(new THREE.BoxGeometry(borderW, frameH - borderW * 2, depth * 0.8), bMat);
        right.position.set(frameW / 2 - borderW / 2, 0, 0);
        group.add(right);

        const dotMat = new THREE.MeshLambertMaterial({ color: 0xd4a840, emissive: 0x3a2600, emissiveIntensity: 0.2 });
        const corners = [
            [-frameW / 2 + borderW * 0.6, frameH / 2 - borderW * 0.6],
            [frameW / 2 - borderW * 0.6, frameH / 2 - borderW * 0.6],
            [-frameW / 2 + borderW * 0.6, -frameH / 2 + borderW * 0.6],
            [frameW / 2 - borderW * 0.6, -frameH / 2 + borderW * 0.6]
        ];
        corners.forEach(function(p) {
            const dot = new THREE.Mesh(new THREE.SphereGeometry(0.02, 5, 4), dotMat);
            dot.position.set(p[0], p[1], depth * 0.5);
            group.add(dot);
        });

        scene.add(group);
    }

    function makePictureFrame(z, facingRight, imageIndex) {
        const wallX = facingRight ? ROOM_W / 2 - 0.02 : -ROOM_W / 2 + 0.02;
        const offsetX = facingRight ? -0.1 : 0.1;
        const posX = wallX + offsetX;
        const rotY = facingRight ? -Math.PI / 2 : Math.PI / 2;
        createFrame(posX, 1.7, z, rotY, imageIndex);
    }

    function makePictureFrameInner(x, imageIndex) {
        createFrame(x, 1.7, 0, 0, imageIndex);
    }
    function makePictureFrameFront(x, imageIndex) {
        createFrame(x, 1.7, HALF_D, Math.PI, imageIndex);
    }

    makePictureFrameInner(-3, 1);
    makePictureFrameInner(6, 2);
    makePictureFrame(4.0, false, 5);
    makePictureFrame(4.0, true, 6);
    makePictureFrameFront(-4, 4);
    makePictureFrameFront(4, 3);

    // ─── TÉLÉVISION ──────────────────────────────────────────────
    function getVideoPath() {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return '/projet/Illusion/videos/thethingsthatiwoulddo.mp4';
        } else {
            return 'videos/thethingsthatiwoulddo.mp4';
        }
    }

    function createIconTexture(symbol) {
        const canvas2 = document.createElement('canvas');
        canvas2.width = 64;
        canvas2.height = 64;
        const ctx = canvas2.getContext('2d');
        ctx.clearRect(0, 0, 64, 64);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(symbol, 32, 34);
        return new THREE.CanvasTexture(canvas2);
    }

    const DEFAULT_VIDEOS = [
        "videos/Ladies and gentlemen, I finally put in effort shorts.mp4",
        "videos/here's a break midst all the angst shorts.mp4",
        "videos/Bungo Stray Dogs cosplays are  shorts.mp4",
        "videos/DO NOT click on the related video unless you wanna be traumatized shorts.mp4",
        "videos/it's not me if I don't experiment shorts.mp4",
        "videos/SkkSoukoku cosplay compilation viralvideo.mp4",
        "videos/It's june you guys know what that means shorts.mp4",
        "videos/Fyolai will live on shorts.mp4",
        "videos/BACK WITH THIS shorts.mp4",
        "videos/I've had this idea for so long shorts.mp4",
        "videos/2nd video in the series shorts.mp4",
        "videos/DAZAI IS SO LUCKY OML shorts.mp4",
        "videos/I hate this one shorts.mp4",
        "videos/HERE'S YOUR DAILY DOSE OF SOUKOKU shorts.mp4",
        "videos/It's june...you guys know what that means shorts.mp4",
        "videos/Did anyone say Stormbringer angst shorts.mp4",
        "videos/Finally a complete Dazai edit shorts.mp4",
        "videos/Collaboration with dazaiiseverything shorts.mp4",
        "videos/If you know , you know shorts.mp4",
        "videos/love this one , actually shorts.mp4",
        "videos/FANART ANALYSIS shorts.mp4",
        "videos/THEY'RE KIDS TOO shorts.mp4",
        "videos/kunizai is next shorts.mp4"
    ];

    let videoList = [];

    function getRandomVideoPath() {
        return new Promise((resolve) => {
            if (videoList.length > 0) {
                const idx = Math.floor(Math.random() * videoList.length);
                console.log('🔀 Vidéo choisie depuis videoList :', videoList[idx]);
                resolve(videoList[idx]);
                return;
            }

            const hostname = window.location.hostname;
            let jsonUrl = (hostname === 'localhost' || hostname === '127.0.0.1')
                ? '/projet/Illusion/videos.json'
                : 'videos.json';

            console.log('📡 Chargement de videos.json depuis :', jsonUrl);

            fetch(jsonUrl)
                .then(response => {
                    if (!response.ok) throw new Error('HTTP ' + response.status);
                    return response.json();
                })
                .then(data => {
                    videoList = data;
                    console.log('✅ JSON chargé, liste :', videoList);
                    const idx = Math.floor(Math.random() * videoList.length);
                    resolve(videoList[idx]);
                })
                .catch(err => {
                    console.warn('⚠️ Échec du JSON, utilisation de DEFAULT_VIDEOS :', err);
                    videoList = DEFAULT_VIDEOS.slice();
                    const idx = Math.floor(Math.random() * videoList.length);
                    resolve(videoList[idx]);
                });
        });
    }

    function createVintageTV() {
        const group = new THREE.Group();
        const shelfMat = new THREE.MeshLambertMaterial({ color: 0x2a1a0a });
        const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 1.0), shelfMat);
        shelf.position.set(0, 0.30, 0);
        shelf.castShadow = true;
        shelf.receiveShadow = true;
        group.add(shelf);

        const legMat = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const legPositions = [
            [-0.75, 0.15, -0.40],
            [0.75, 0.15, -0.40],
            [-0.75, 0.15, 0.40],
            [0.75, 0.15, 0.40]
        ];
        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.30, 6), legMat);
            leg.position.set(pos[0], pos[1], pos[2]);
            leg.castShadow = true;
            group.add(leg);
        });

        const driveGroup = new THREE.Group();
        const driveMat = new THREE.MeshLambertMaterial({ color: 0xd4c8b0 });
        const driveBody = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.35), driveMat);
        driveBody.position.set(0, 0.40, 0);
        driveBody.castShadow = true;
        driveBody.receiveShadow = true;
        driveGroup.add(driveBody);
        const slotMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
        const slot = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.02, 0.02), slotMat);
        slot.position.set(0, 0.40, 0.18);
        driveGroup.add(slot);
        const ejectMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
        const ejectBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 8), ejectMat);
        ejectBtn.rotation.x = Math.PI / 2;
        ejectBtn.position.set(0.12, 0.40, 0.16);
        driveGroup.add(ejectBtn);
        const ledMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const led = new THREE.Mesh(new THREE.CircleGeometry(0.015, 8), ledMat);
        led.position.set(-0.10, 0.40, 0.18);
        driveGroup.add(led);
        const stripeMat = new THREE.MeshLambertMaterial({ color: 0x887868 });
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.02, 0.01), stripeMat);
        stripe.position.set(0, 0.40, 0.175);
        driveGroup.add(stripe);
        driveGroup.position.set(0, 0.0, 0);
        group.add(driveGroup);

        const standMat = new THREE.MeshLambertMaterial({ color: 0x1a1008 });
        const stand = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.10, 0.6), standMat);
        stand.position.set(0, 0.44, 0);
        stand.castShadow = true;
        stand.receiveShadow = true;
        group.add(stand);

        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.7, roughness: 0.3 });
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 0.7), bodyMat);
        body.position.set(0, 0.90, 0);
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        const screenWidth = 1.05,
            screenHeight = 0.68;
        const blackMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
        const screen = new THREE.Mesh(new THREE.PlaneGeometry(screenWidth, screenHeight), blackMat);
        screen.position.set(0, 0.90, 0.39);
        group.add(screen);

        const video = document.createElement('video');
        video.loop = false;
        video.muted = false;
        video.playsInline = true;
        video.crossOrigin = "anonymous";
        video.preload = "auto";

        let history = [];
        let historyIndex = -1;

        function loadVideoAndAddToHistory(videoPath) {
            const hostname = window.location.hostname;
            let fullPath = (hostname === 'localhost' || hostname === '127.0.0.1')
                ? '/projet/Illusion/' + videoPath
                : videoPath;

            if (historyIndex < history.length - 1) {
                history = history.slice(0, historyIndex + 1);
            }
            history.push(fullPath);
            historyIndex = history.length - 1;

            video.src = fullPath;
            video.load();
            if (window._isOn) {
                video.play().catch(() => {});
            }
            saveTVState();
        }

        function loadRandomVideo() {
            getRandomVideoPath()
                .then(videoPath => {
                    loadVideoAndAddToHistory(videoPath);
                })
                .catch(err => {
                    console.error('❌ Erreur fatale, fallback ultime', err);
                    loadVideoAndAddToHistory(DEFAULT_VIDEOS[0]);
                });
        }

        function nextVideo() {
            getRandomVideoPath()
                .then(videoPath => {
                    const hostname = window.location.hostname;
                    let fullPath = (hostname === 'localhost' || hostname === '127.0.0.1')
                        ? '/projet/Illusion/' + videoPath
                        : videoPath;
                    if (historyIndex < history.length - 1) {
                        history = history.slice(0, historyIndex + 1);
                    }
                    history.push(fullPath);
                    historyIndex = history.length - 1;
                    video.src = fullPath;
                    video.load();
                    if (window._isOn) {
                        video.play().catch(() => {});
                    }
                    saveTVState();
                });
        }

        function prevVideo() {
            if (historyIndex <= 0) {
                loadRandomVideo();
                return;
            }
            historyIndex--;
            const fullPath = history[historyIndex];
            video.src = fullPath;
            video.load();
            if (window._isOn) {
                video.play().catch(() => {});
            }
            saveTVState();
        }

        loadRandomVideo();

        video.addEventListener('ended', function() {
            loadRandomVideo();
        });

        let storedState = null;
        try {
            const raw = sessionStorage.getItem('tvState');
            if (raw) storedState = JSON.parse(raw);
        } catch (e) {}
        let isOn = true;
        let previousVolume = storedState ? storedState.volume : 0.6;
        let videoMaterial = null;
        let videoStarted = false;

        function saveTVState() {
            try {
                sessionStorage.setItem('tvState', JSON.stringify({
                    isOn: isOn,
                    volume: video.volume || 0.6
                }));
            } catch (e) {}
        }

        function startVideo() {
            if (!videoStarted) {
                video.play().then(() => {
                    videoStarted = true;
                    if (!isOn) { video.pause();
                        video.volume = 0; }
                    saveTVState();
                }).catch(() => {
                    document.addEventListener('click', startVideo, { once: true });
                });
            }
        }
        document.addEventListener('click', startVideo, { once: true });

        video.addEventListener('canplaythrough', function() {
            if (!videoStarted) startVideo();
            const videoTexture = new THREE.VideoTexture(video);
            videoTexture.minFilter = THREE.LinearFilter;
            videoTexture.magFilter = THREE.LinearFilter;
            window._videoTexture = videoTexture;
            videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture, side: THREE.DoubleSide });
            if (isOn) {
                screen.material = videoMaterial;
            } else {
                screen.material = blackMat;
                video.pause();
                video.volume = 0;
            }
            screen.material.needsUpdate = true;
            saveTVState();
        });

        video.addEventListener('error', function(e) {
            console.error('❌ Erreur vidéo :', video.src, e);
        });

        const frameMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
        const frame = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.75, 0.04), frameMat);
        frame.position.set(0, 0.90, 0.35);
        group.add(frame);

        const knobMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.5, roughness: 0.4 });
        const knobConfigs = [
            { x: -0.4, symbol: '⏻', action: 'power' },
            { x: 0, symbol: '+', action: 'next' },
            { x: 0.4, symbol: '−', action: 'prev' }
        ];
        const knobMeshes = [];
        knobConfigs.forEach((cfg) => {
            const mat = knobMat.clone();
            const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.10, 8), mat);
            knob.rotation.x = Math.PI / 2;
            knob.position.set(cfg.x, 0.47, 0.42);
            knob.castShadow = true;
            group.add(knob);
            knobMeshes.push(knob);
            knob.userData.action = cfg.action;
            const iconTex = createIconTexture(cfg.symbol);
            const iconMat = new THREE.MeshBasicMaterial({
                map: iconTex,
                transparent: true,
                side: THREE.DoubleSide,
                depthTest: true,
                depthWrite: false
            });
            const icon = new THREE.Mesh(new THREE.PlaneGeometry(0.10, 0.10), iconMat);
            icon.position.set(cfg.x, 0.47, 0.48);
            group.add(icon);
        });
        const antMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 });
        const start1 = new THREE.Vector3(-0.30, 1.35, 0.1);
        const end1 = new THREE.Vector3(-0.40, 2.05, 0.15);
        const mid1 = new THREE.Vector3().addVectors(start1, end1).multiplyScalar(0.5);
        const dir1 = new THREE.Vector3().subVectors(end1, start1);
        const len1 = dir1.length();
        dir1.normalize();
        const ant1 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, len1, 4), antMat);
        ant1.position.copy(mid1);
        ant1.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir1);
        group.add(ant1);
        const ballMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 });
        const ball1 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), ballMat);
        ball1.position.copy(end1);
        group.add(ball1);
        const start2 = new THREE.Vector3(0.30, 1.35, 0.1);
        const end2 = new THREE.Vector3(0.40, 2.05, 0.15);
        const mid2 = new THREE.Vector3().addVectors(start2, end2).multiplyScalar(0.5);
        const dir2 = new THREE.Vector3().subVectors(end2, start2);
        const len2 = dir2.length();
        dir2.normalize();
        const ant2 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, len2, 4), antMat);
        ant2.position.copy(mid2);
        ant2.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir2);
        group.add(ant2);
        const ball2 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), ballMat);
        ball2.position.copy(end2);
        group.add(ball2);

        group.position.set(-7, 0.0, 7.2);
        group.rotation.y = +Math.PI / 1.2;
        scene.add(group);

        window._knobMeshes = knobMeshes;
        window._screen = screen;
        window._video = video;
        window._blackMat = blackMat;
        window._videoMaterial = videoMaterial;
        window._isOn = isOn;
        window._tvPosition = group.position.clone();

        function highlightKnob(knob) {
            if (knob) {
                knob.material.color.setHex(0xcccccc);
                knob.material.emissive = new THREE.Color(0xffffaa);
                knob.material.emissiveIntensity = 0.2;
            }
        }

        function unhighlightKnob(knob) {
            if (knob) {
                knob.material.color.setHex(0x888888);
                knob.material.emissive = new THREE.Color(0x000000);
                knob.material.emissiveIntensity = 0;
            }
        }

        function animateKnobPress(knob, callback) {
            const originalY = knob.position.y;
            const targetY = originalY - 0.02;
            const duration = 150;
            const startTime = performance.now();

            function press(time) {
                const elapsed = time - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const currentY = originalY + (targetY - originalY) * eased;
                knob.position.y = currentY;
                if (progress < 1) {
                    requestAnimationFrame(press);
                } else {
                    const upStart = performance.now();
                    function up(time2) {
                        const elapsed2 = time2 - upStart;
                        const progress2 = Math.min(elapsed2 / duration, 1);
                        const eased2 = 1 - Math.pow(1 - progress2, 3);
                        const currentY2 = targetY + (originalY - targetY) * eased2;
                        knob.position.y = currentY2;
                        if (progress2 < 1) {
                            requestAnimationFrame(up);
                        } else {
                            knob.position.y = originalY;
                            if (callback) callback();
                        }
                    }
                    requestAnimationFrame(up);
                }
            }
            requestAnimationFrame(press);
        }

        window._highlightKnob = highlightKnob;
        window._unhighlightKnob = unhighlightKnob;
        window._animateKnobPress = animateKnobPress;
        window._nextVideo = nextVideo;
        window._prevVideo = prevVideo;

        console.log('📺 Télévision ajoutée.');
    }

    createVintageTV();

    // ─── CARTON AVEC DEUX RABATS ────────────────────────────────
    function createCardboardBox() {
        const group = new THREE.Group();
        const boxW = 1.2,
            boxH = 0.7,
            boxD = 0.9;
        const thick = 0.025;

        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 256;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#b8956a';
        ctx.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 300; i++) {
            const x = Math.random() * 256,
                y = Math.random() * 256;
            const v = 120 + Math.random() * 70;
            ctx.fillStyle = 'rgb(' + v + ',' + (v - 15) + ',' + (v - 30) + ')';
            ctx.fillRect(x, y, 3 + Math.random() * 8, 2 + Math.random() * 6);
        }
        ctx.strokeStyle = 'rgba(70,40,10,0.12)';
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 25; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * 11 + 3);
            for (let x = 0; x < 256; x += 4) {
                ctx.lineTo(x, i * 11 + 3 + Math.sin(x / 18) * 5);
            }
            ctx.stroke();
        }
        ctx.fillStyle = 'rgba(60,35,15,0.2)';
        ctx.fillRect(0, 0, 20, 20);
        ctx.fillRect(236, 0, 20, 20);
        ctx.fillRect(0, 236, 20, 20);
        ctx.fillRect(236, 236, 20, 20);
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(2, 2);

        const extMat = new THREE.MeshStandardMaterial({ map: tex, color: 0xccaa88, roughness: 0.85 });
        const intMat = new THREE.MeshStandardMaterial({ color: 0x8a7a6a, roughness: 0.9, side: THREE.DoubleSide });
        const hiMat = new THREE.MeshStandardMaterial({ map: tex, color: 0xddbb99, emissive: 0x553322, emissiveIntensity: 0.2 });

        const bottom = new THREE.Mesh(new THREE.BoxGeometry(boxW, thick, boxD), extMat);
        bottom.position.set(0, -boxH / 2, 0);
        bottom.castShadow = true;
        bottom.receiveShadow = true;
        group.add(bottom);

        const back = new THREE.Mesh(new THREE.BoxGeometry(boxW, boxH, thick), extMat);
        back.position.set(0, 0, -boxD / 2);
        back.castShadow = true;
        back.receiveShadow = true;
        group.add(back);
        const front = new THREE.Mesh(new THREE.BoxGeometry(boxW, boxH, thick), extMat);
        front.position.set(0, 0, boxD / 2);
        front.castShadow = true;
        front.receiveShadow = true;
        group.add(front);
        const left = new THREE.Mesh(new THREE.BoxGeometry(thick, boxH, boxD), extMat);
        left.position.set(-boxW / 2, 0, 0);
        left.castShadow = true;
        left.receiveShadow = true;
        group.add(left);
        const right = new THREE.Mesh(new THREE.BoxGeometry(thick, boxH, boxD), extMat);
        right.position.set(boxW / 2, 0, 0);
        right.castShadow = true;
        right.receiveShadow = true;
        group.add(right);

        const intBack = new THREE.Mesh(new THREE.PlaneGeometry(boxW - thick * 2, boxH - thick * 2), intMat);
        intBack.position.set(0, 0, -boxD / 2 + thick + 0.001);
        group.add(intBack);
        const intFront = new THREE.Mesh(new THREE.PlaneGeometry(boxW - thick * 2, boxH - thick * 2), intMat);
        intFront.position.set(0, 0, boxD / 2 - thick - 0.001);
        intFront.rotation.y = Math.PI;
        group.add(intFront);
        const intLeft = new THREE.Mesh(new THREE.PlaneGeometry(boxD - thick * 2, boxH - thick * 2), intMat);
        intLeft.position.set(-boxW / 2 + thick + 0.001, 0, 0);
        intLeft.rotation.y = -Math.PI / 2;
        group.add(intLeft);
        const intRight = new THREE.Mesh(new THREE.PlaneGeometry(boxD - thick * 2, boxH - thick * 2), intMat);
        intRight.position.set(boxW / 2 - thick - 0.001, 0, 0);
        intRight.rotation.y = Math.PI / 2;
        group.add(intRight);

        const pivotFront = new THREE.Group();
        pivotFront.position.set(0, boxH / 2, boxD / 2);
        group.add(pivotFront);
        const flapFront = new THREE.Mesh(new THREE.BoxGeometry(boxW, thick, boxD / 2), extMat);
        flapFront.position.set(0, 0, -boxD / 4);
        flapFront.castShadow = true;
        flapFront.receiveShadow = true;
        pivotFront.add(flapFront);
        const intFlapFront = new THREE.Mesh(new THREE.PlaneGeometry(boxW - thick * 2, boxD / 2 - thick * 2), intMat);
        intFlapFront.position.set(0, -thick / 2 - 0.001, -boxD / 4);
        intFlapFront.rotation.x = -Math.PI / 2;
        pivotFront.add(intFlapFront);

        const pivotBack = new THREE.Group();
        pivotBack.position.set(0, boxH / 2, -boxD / 2);
        group.add(pivotBack);
        const flapBack = new THREE.Mesh(new THREE.BoxGeometry(boxW, thick, boxD / 2), extMat);
        flapBack.position.set(0, 0, boxD / 4);
        flapBack.castShadow = true;
        flapBack.receiveShadow = true;
        pivotBack.add(flapBack);
        const intFlapBack = new THREE.Mesh(new THREE.PlaneGeometry(boxW - thick * 2, boxD / 2 - thick * 2), intMat);
        intFlapBack.position.set(0, -thick / 2 - 0.001, boxD / 4);
        intFlapBack.rotation.x = -Math.PI / 2;
        pivotBack.add(intFlapBack);

        const imageUrl = getImagePath('cartonnote.png');
        const textureLoader = new THREE.TextureLoader();
        const noteTexture = textureLoader.load(imageUrl);
        noteTexture.wrapS = THREE.ClampToEdgeWrapping;
        noteTexture.wrapT = THREE.ClampToEdgeWrapping;
        noteTexture.repeat.set(1, 1);

        const imageMat = new THREE.MeshStandardMaterial({
            map: noteTexture,
            transparent: true,
            side: THREE.DoubleSide,
            roughness: 0.7,
            polygonOffset: true,
            polygonOffsetFactor: -1,
            polygonOffsetUnits: -1
        });

        const imagePlane = new THREE.Mesh(
            new THREE.PlaneGeometry(boxW * 0.7, (boxD / 2) * 0.7),
            imageMat
        );
        imagePlane.position.set(0, thick / 2 + 0.005, boxD / 4);
        imagePlane.rotation.x = -Math.PI / 2;
        imagePlane.frustumCulled = false;
        imagePlane.rotation.y = 0;
        pivotBack.add(imagePlane);

        window._cartonRabats = [{
            pivot: pivotFront,
            mesh: flapFront,
            open: false,
            targetAngle: 0,
            animating: false,
            originalMat: extMat,
            hiMat: new THREE.MeshStandardMaterial({ map: extMat.map, color: 0xddbb99, emissive: 0x553322, emissiveIntensity: 0.2 })
        }, {
            pivot: pivotBack,
            mesh: flapBack,
            open: false,
            targetAngle: 0,
            animating: false,
            originalMat: extMat,
            hiMat: new THREE.MeshStandardMaterial({ map: extMat.map, color: 0xddbb99, emissive: 0x553322, emissiveIntensity: 0.2 })
        }];
        window._cartonMaterials = { woodMat: extMat, woodHiMat: hiMat };

        group.position.set(-5, 0.35, 7);
        group.userData.isCarton = true;
        group.rotation.y = 0.0;
        scene.add(group);

        window._cartonCollision = {
            group: group,
            halfW: boxW / 2,
            halfH: boxH / 2,
            halfD: boxD / 2,
            center: group.position.clone()
        };
        window._cartonPosition = group.position.clone();

        console.log('📦 Carton avec image');
        return group;
    }

    createCardboardBox();

    // ─── MEUBLE À TIROIR ──────────────────────────────────────────────
    function createPedestalDrawer(config) {
        const {
            posX = -6.88,
            posY = 0.0,
            posZ = 5.29,
            width = 0.70,
            depth = 0.60,
            height = 0.65,
            legHeight = 0.50,
            drawerHeight = 0.22,
            color = 0x8a7a5a,
            legColor = 0x555555,
            handleColor = 0xccaa88,
            openDistance = 0.28,
        } = config || {};

        const group = new THREE.Group();
        group.position.set(posX, posY, posZ);

        const legMat = new THREE.MeshStandardMaterial({ color: legColor, roughness: 0.3, metalness: 0.2 });
        const legPositions = [
            [-width/2 + 0.06, -depth/2 + 0.06],
            [ width/2 + 0.06, -depth/2 + 0.06],
            [-width/2 + 0.06,  depth/2 + 0.06],
            [ width/2 + 0.06,  depth/2 + 0.06]
        ];
        legPositions.forEach(([x, z]) => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, legHeight, 8), legMat);
            leg.position.set(x, legHeight/2, z);
            leg.castShadow = true;
            group.add(leg);
        });

        const baseMat = new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.7 });
        const base = new THREE.Mesh(new THREE.BoxGeometry(width + 0.02, 0.04, depth + 0.02), baseMat);
        base.position.set(0, legHeight, 0);
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);

        const bodyMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.6 });
        const bodyHeight = height - legHeight - drawerHeight - 0.04;
        const body = new THREE.Mesh(new THREE.BoxGeometry(width, bodyHeight, depth), bodyMat);
        body.position.set(0, legHeight + 0.04 + bodyHeight/2, 0);
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        const drawerGroup = new THREE.Group();
        drawerGroup.position.set(0, legHeight + 0.04 + bodyHeight/2, 0);
        group.add(drawerGroup);

        const innerW = width * 0.74;
        const innerH = drawerHeight * 0.74;
        const innerD = depth * 0.45;
        const innerMat = new THREE.MeshStandardMaterial({ color: 0xab8b6a, roughness: 0.8 });

        const bottom = new THREE.Mesh(new THREE.BoxGeometry(innerW, 0.015, innerD), innerMat);
        bottom.position.set(0, -innerH/2, -0.02);
        bottom.castShadow = true;
        drawerGroup.add(bottom);
        const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.015, innerH, innerD), innerMat);
        leftWall.position.set(-innerW/2, 0, -0.02);
        leftWall.castShadow = true;
        drawerGroup.add(leftWall);
        const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.015, innerH, innerD), innerMat);
        rightWall.position.set(innerW/2, 0, -0.02);
        rightWall.castShadow = true;
        drawerGroup.add(rightWall);
        const backWall = new THREE.Mesh(new THREE.BoxGeometry(innerW, innerH, 0.015), innerMat);
        backWall.position.set(0, 0, -innerD - 0.02);
        backWall.castShadow = true;
        drawerGroup.add(backWall);

        const frontMat = new THREE.MeshStandardMaterial({ color: 0xb89a7a, roughness: 0.5 });
        const frontPanel = new THREE.Mesh(
            new THREE.BoxGeometry(width * 0.84, drawerHeight * 0.87, 0.025),
            frontMat
        );
        frontPanel.position.set(0, 0, depth/2 + 0.005);
        frontPanel.castShadow = true;
        frontPanel.receiveShadow = true;
        drawerGroup.add(frontPanel);

        const handleMat = new THREE.MeshStandardMaterial({ color: handleColor, metalness: 0.6, roughness: 0.3 });
        const hBaseL = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.05, 6), handleMat);
        hBaseL.rotation.x = Math.PI / 2;
        hBaseL.position.set(-0.12, 0.04, depth/2 + 0.04);
        drawerGroup.add(hBaseL);
        const hBaseR = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.05, 6), handleMat);
        hBaseR.rotation.x = Math.PI / 2;
        hBaseR.position.set(0.12, 0.04, depth/2 + 0.04);
        drawerGroup.add(hBaseR);
        const handleBar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.24, 8), handleMat);
        handleBar.rotation.z = Math.PI / 2;
        handleBar.position.set(0, 0.04, depth/2 + 0.04);
        drawerGroup.add(handleBar);

        const clickArea = new THREE.Mesh(
            new THREE.PlaneGeometry(width * 0.80, drawerHeight * 0.85),
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide })
        );
        clickArea.position.set(0, 0, depth/2 + 0.03);
        drawerGroup.add(clickArea);

        const drawerState = {
            group: drawerGroup,
            isOpen: false,
            isAnimating: false,
            targetZ: 0,
            openDistance: openDistance,
            frontPanel: frontPanel,
            frontMat: frontMat,
            hoverMat: new THREE.MeshStandardMaterial({ color: 0xd4b89a, roughness: 0.3 }),
            handleMat: handleMat,
            clickArea: clickArea,
            originalHandleColor: handleColor,
        };

        if (!window._pedestalDrawers) window._pedestalDrawers = [];
        window._pedestalDrawers.push(drawerState);
        window._pedestalPosition = group.position.clone();

        scene.add(group);
        console.log('🪑 Meuble à tiroir unique (pieds longs) créé');
        return drawerState;
    }

    createPedestalDrawer({
        posX: -6.88,
        posY: 0.0,
        posZ: 5.29,
        width: 0.70,
        depth: 0.60,
        height: 0.65,
        legHeight: 0.50,
        drawerHeight: 0.22,
        color: 0x7a6a5a,
        legColor: 0x555555,
        handleColor: 0xccaa88,
        openDistance: 0.28,
    });

    // ─── GRAND TABLEAU VERT ──────────────────────────────────────
    (function createGreenBoard() {
        const group = new THREE.Group();
        const boardW = 2.8;
        const boardH = 2.0;
        const depth = 0.06;
        const posX = 1;
        const posY = 1.70;
        const posZ = 0;

        const greenMat = new THREE.MeshStandardMaterial({ color: 0x2a6b2a, roughness: 0.7, metalness: 0.05 });
        const boardMesh = new THREE.Mesh(new THREE.BoxGeometry(boardW, boardH, depth), greenMat);
        boardMesh.position.set(0, 0, 0);
        boardMesh.castShadow = true;
        boardMesh.receiveShadow = true;
        group.add(boardMesh);

        const chalkCanvas = document.createElement('canvas');
        chalkCanvas.width = 256;
        chalkCanvas.height = 256;
        const ctx2 = chalkCanvas.getContext('2d');
        ctx2.fillStyle = '#2a6b2a';
        ctx2.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 800; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const v = 60 + Math.random() * 40;
            ctx2.fillStyle = 'rgba(' + v + ',' + (v + 30) + ',' + v + ',0.08)';
            ctx2.fillRect(x, y, 2 + Math.random() * 4, 1 + Math.random() * 3);
        }
        const chalkTex = new THREE.CanvasTexture(chalkCanvas);
        chalkTex.wrapS = chalkTex.wrapT = THREE.ClampToEdgeWrapping;

        const textureMat = new THREE.MeshStandardMaterial({
            map: chalkTex,
            transparent: true,
            opacity: 0.25,
            side: THREE.DoubleSide,
            roughness: 0.9
        });
        const texturePlane = new THREE.Mesh(
            new THREE.PlaneGeometry(boardW - 0.1, boardH - 0.1),
            textureMat
        );
        texturePlane.position.set(0, 0, depth / 2 + 0.001);
        group.add(texturePlane);

        const imageUrl = getImagePath('enquete.png');
        const loader = new THREE.TextureLoader();
        const imgMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            roughness: 0.3,
            polygonOffset: true,
            polygonOffsetFactor: -1,
            polygonOffsetUnits: -1
        });
        const imgPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(boardW * 0.82, boardH * 0.82),
            imgMat
        );
        imgPlane.position.set(0, 0, depth / 2 + 0.003);
        imgPlane.castShadow = false;
        imgPlane.receiveShadow = false;
        group.add(imgPlane);

        loader.load(imageUrl, function(tex) {
            const aspect = tex.image.width / tex.image.height;
            const planeAspect = (boardW * 0.82) / (boardH * 0.82);
            let scaleW = 1,
                scaleH = 1;
            if (aspect > planeAspect) {
                scaleH = planeAspect / aspect;
            } else {
                scaleW = aspect / planeAspect;
            }
            imgPlane.scale.set(scaleW, scaleH, 1);
            imgPlane.material = new THREE.MeshStandardMaterial({
                map: tex,
                side: THREE.DoubleSide,
                roughness: 0.3,
                polygonOffset: true,
                polygonOffsetFactor: -1,
                polygonOffsetUnits: -1
            });
            imgPlane.material.needsUpdate = true;
        }, undefined, function() {
            const fallbackCanvas = document.createElement('canvas');
            fallbackCanvas.width = 512;
            fallbackCanvas.height = 384;
            const fctx = fallbackCanvas.getContext('2d');
            fctx.fillStyle = '#1a3a1a';
            fctx.fillRect(0, 0, 512, 384);
            fctx.fillStyle = '#d4b870';
            fctx.font = 'bold 42px Georgia, serif';
            fctx.textAlign = 'center';
            fctx.textBaseline = 'middle';
            fctx.fillText('📄 enquete.png', 256, 180);
            fctx.font = '24px Georgia, serif';
            fctx.fillStyle = '#a08050';
            fctx.fillText('image non trouvée', 256, 250);
            const fallbackTex = new THREE.CanvasTexture(fallbackCanvas);
            imgPlane.material = new THREE.MeshStandardMaterial({
                map: fallbackTex,
                side: THREE.DoubleSide,
                roughness: 0.4,
                polygonOffset: true,
                polygonOffsetFactor: -1,
                polygonOffsetUnits: -1
            });
            imgPlane.material.needsUpdate = true;
            console.warn('⚠️ Image enquete.png non chargée, fallback affiché.');
        });

        const frameMat2 = new THREE.MeshStandardMaterial({ color: 0x6a4e2e, roughness: 0.7, metalness: 0.1 });
        const frameW = 0.07;
        const topFrame2 = new THREE.Mesh(new THREE.BoxGeometry(boardW + 0.06, frameW, 0.12), frameMat2);
        topFrame2.position.set(0, boardH / 2 + frameW / 2, 0);
        topFrame2.castShadow = true;
        group.add(topFrame2);
        const botFrame2 = new THREE.Mesh(new THREE.BoxGeometry(boardW + 0.06, frameW, 0.12), frameMat2);
        botFrame2.position.set(0, -boardH / 2 - frameW / 2, 0);
        botFrame2.castShadow = true;
        group.add(botFrame2);
        const leftFrame2 = new THREE.Mesh(new THREE.BoxGeometry(frameW, boardH + 0.06, 0.12), frameMat2);
        leftFrame2.position.set(-boardW / 2 - frameW / 2, 0, 0);
        leftFrame2.castShadow = true;
        group.add(leftFrame2);
        const rightFrame2 = new THREE.Mesh(new THREE.BoxGeometry(frameW, boardH + 0.06, 0.12), frameMat2);
        rightFrame2.position.set(boardW / 2 + frameW / 2, 0, 0);
        rightFrame2.castShadow = true;
        group.add(rightFrame2);

        const cornerMat = new THREE.MeshStandardMaterial({ color: 0x8a6a3a, roughness: 0.5, metalness: 0.2 });
        const cornerPositions = [
            [-boardW / 2 + 0.08, boardH / 2 - 0.08],
            [boardW / 2 - 0.08, boardH / 2 - 0.08],
            [-boardW / 2 + 0.08, -boardH / 2 + 0.08],
            [boardW / 2 - 0.08, -boardH / 2 + 0.08]
        ];
        cornerPositions.forEach(([cx, cy]) => {
            const corner = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), cornerMat);
            corner.position.set(cx, cy, 0.07);
            group.add(corner);
        });

        group.position.set(posX, posY, posZ);
        group.rotation.y = 0;
        scene.add(group);
        window._greenBoardPosition = group.position.clone();
        console.log('🟩 Tableau vert avec enquete.png ajouté');
    })();

    // ─── INTERACTIONS ──────────────────────────────────────────────
    function setupTVInteractions() {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let hoveredKnob = null;

        canvas.addEventListener('mousemove', function(event) {
            const rect = canvas.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);

            const knobMeshes = window._knobMeshes || [];
            const intersects = raycaster.intersectObjects(knobMeshes, false);
            let newHover = null;
            if (intersects.length > 0) {
                newHover = intersects[0].object;
                canvas.style.cursor = 'pointer';
            } else {
                canvas.style.cursor = 'default';
            }

            if (newHover !== hoveredKnob) {
                if (hoveredKnob) {
                    window._unhighlightKnob(hoveredKnob);
                }
                hoveredKnob = newHover;
                if (hoveredKnob) {
                    window._highlightKnob(hoveredKnob);
                }
            }
        });

        canvas.addEventListener('click', function(event) {
            const rect = canvas.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);

            const knobMeshes = window._knobMeshes || [];
            const intersects = raycaster.intersectObjects(knobMeshes, false);
            if (intersects.length > 0) {
                const obj = intersects[0].object;
                const action = obj.userData.action;
                if (action) {
                    window._animateKnobPress(obj, function() {
                        handleKnobAction(action);
                    });
                }
            }
        });

        function handleKnobAction(action) {
            const video = window._video;
            const screen = window._screen;
            const blackMat = window._blackMat;
            const videoMaterial = window._videoMaterial;
            let isOn = window._isOn;

            switch (action) {
                case 'power':
                    if (isOn) {
                        window._previousVolume = video.volume || 0.6;
                        video.pause();
                        video.volume = 0;
                        screen.material = blackMat;
                        window._isOn = false;
                    } else {
                        video.play().catch(() => {});
                        video.volume = window._previousVolume > 0 ? window._previousVolume : 0.6;
                        if (videoMaterial) {
                            screen.material = videoMaterial;
                        } else {
                            const fallbackTex = new THREE.VideoTexture(video);
                            fallbackTex.minFilter = THREE.LinearFilter;
                            fallbackTex.magFilter = THREE.LinearFilter;
                            screen.material = new THREE.MeshBasicMaterial({ map: fallbackTex, side: THREE.DoubleSide });
                        }
                        window._isOn = true;
                    }
                    break;
                case 'next':
                    window._nextVideo();
                    break;
                case 'prev':
                    window._prevVideo();
                    break;
            }
            try {
                sessionStorage.setItem('tvState', JSON.stringify({
                    isOn: window._isOn,
                    volume: video.volume || 0.6
                }));
            } catch (e) {}
        }
    }
    setupTVInteractions();

    function setupCartonInteractions() {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let hoveredRabat = null;

        function onMouseMove(event) {
            const rect = canvas.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);

            const rabats = window._cartonRabats || [];
            const meshes = rabats.map(r => r.mesh);
            const intersects = raycaster.intersectObjects(meshes);
            let newHover = null;
            if (intersects.length > 0) {
                const hit = intersects[0].object;
                for (let r of rabats) {
                    if (r.mesh === hit) { newHover = r; break; }
                }
            }

            if (newHover !== hoveredRabat) {
                if (hoveredRabat && !hoveredRabat.open) {
                    hoveredRabat.mesh.material = hoveredRabat.originalMat;
                }
                if (newHover && !newHover.open) {
                    newHover.mesh.material = newHover.hiMat;
                    canvas.style.cursor = 'pointer';
                } else {
                    canvas.style.cursor = 'default';
                }
                hoveredRabat = newHover;
            }
        }

        function onMouseClick(event) {
            if (!hoveredRabat) return;
            const r = hoveredRabat;
            if (r.animating) return;

            r.open = !r.open;
            r.targetAngle = r.open ? (r.pivot.position.z > 0 ? Math.PI : -Math.PI) : 0;
            r.animating = true;
            const startAngle = r.pivot.rotation.x;
            const targetAngle = r.targetAngle;
            const duration = 500;
            const startTime = performance.now();

            function animateRabat(time) {
                const elapsed = time - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                r.pivot.rotation.x = startAngle + (targetAngle - startAngle) * eased;
                if (progress < 1) {
                    requestAnimationFrame(animateRabat);
                } else {
                    r.pivot.rotation.x = targetAngle;
                    r.animating = false;
                    if (r.open) {
                        r.mesh.material = r.originalMat;
                    }
                    if (hoveredRabat === r && !r.open) {
                        r.mesh.material = r.hiMat;
                    }
                }
            }
            requestAnimationFrame(animateRabat);
        }

        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('click', onMouseClick);
    }
    setupCartonInteractions();

    function setupPedestalInteractions() {
        if (!window._pedestalDrawers) return;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let hoveredDrawer = null;

        canvas.addEventListener('mousemove', function(event) {
            const rect = canvas.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);

            let newHover = null;
            for (let d of window._pedestalDrawers) {
                const intersects = raycaster.intersectObject(d.clickArea, false);
                if (intersects.length > 0) {
                    newHover = d;
                    break;
                }
            }

            if (newHover !== hoveredDrawer) {
                if (hoveredDrawer && !hoveredDrawer.isOpen) {
                    hoveredDrawer.frontPanel.material = hoveredDrawer.frontMat;
                    hoveredDrawer.handleMat.color.setHex(hoveredDrawer.originalHandleColor);
                }
                if (newHover && !newHover.isOpen) {
                    newHover.frontPanel.material = newHover.hoverMat;
                    newHover.handleMat.color.setHex(0xffdd99);
                    canvas.style.cursor = 'pointer';
                } else {
                    canvas.style.cursor = 'default';
                }
                hoveredDrawer = newHover;
            }
        });

        canvas.addEventListener('click', function(event) {
            if (!hoveredDrawer) return;
            const d = hoveredDrawer;
            if (d.isAnimating) return;

            d.isOpen = !d.isOpen;
            d.isAnimating = true;
            const targetZ = d.isOpen ? d.openDistance : 0;
            const startZ = d.group.position.z;
            const duration = 450;
            const startTime = performance.now();

            function animateDrawer(time) {
                const elapsed = time - startTime;
                let progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3) * Math.cos(progress * 2.5 * Math.PI);
                const currentZ = startZ + (targetZ - startZ) * eased;
                d.group.position.z = currentZ;

                if (progress < 1) {
                    requestAnimationFrame(animateDrawer);
                } else {
                    d.group.position.z = targetZ;
                    d.isAnimating = false;
                    if (!d.isOpen) {
                        d.frontPanel.material = d.frontMat;
                        d.handleMat.color.setHex(d.originalHandleColor);
                    }
                }
            }
            requestAnimationFrame(animateDrawer);
        });
    }
    setupPedestalInteractions();

    // ─── PORTE EXTÉRIEURE – INTERACTION (sans redirection) ──────────────
    function setupDoorInteraction() {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let doorHover = false;

        canvas.addEventListener('mousemove', function(event) {
            const rect = canvas.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);

            const pivot = window._doorPivot;
            if (!pivot) return;
            const doorGroup = window._doorGroup;
            const meshes = [];
            doorGroup.children.forEach(child => {
                if (child.isMesh && (child === window._doorMesh || child.userData.isClickArea)) {
                    meshes.push(child);
                }
            });
            const intersects = raycaster.intersectObjects(meshes);
            if (intersects.length > 0) {
                canvas.style.cursor = 'pointer';
                if (!doorHover) {
                    window._doorMesh.material = mDoorHighlight;
                    doorHover = true;
                }
            } else {
                canvas.style.cursor = 'default';
                if (doorHover) {
                    window._doorMesh.material = mDoor;
                    doorHover = false;
                }
            }
        });

       canvas.addEventListener('click', function(event) {
    if (!doorHover) return;
    const pivot = window._doorPivot;
    if (!pivot || window._doorAnimating) return;

    // État actuel
    const isOpen = window._doorOpen;
    // Angle cible : 0 si fermé, PI/2 si ouvert
    const targetAngle = isOpen ? 0 : Math.PI / 2;
    // Inverser l'état
    window._doorOpen = !isOpen;
    window._doorData.isOpen = window._doorOpen;
    window._doorAnimating = true;

    const startAngle = pivot.rotation.y;
    const duration = 600;
    const startTime = performance.now();

    function animateDoor(time) {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const angle = startAngle + (targetAngle - startAngle) * eased;
        pivot.rotation.y = angle;
        if (progress < 1) {
            requestAnimationFrame(animateDoor);
        } else {
            pivot.rotation.y = targetAngle;
            window._doorAnimating = false;
        }
    }
    requestAnimationFrame(animateDoor);
});
    }
    setupDoorInteraction();

    // ─── MONOLOGUES CONTEXTUELS ──────────────────────────────────────
    let monologueData = null;
    let lastMonologueTime = 0;
    const monologueCooldown = 5000;
    let currentMonologueZone = null;

    function loadMonologueData() {
        const url = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            ? '/projet/Illusion/monologues.json'
            : 'monologues.json';
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error('HTTP ' + response.status);
                return response.json();
            })
            .then(data => {
                monologueData = data;
                console.log('📜 Monologues chargés :', Object.keys(monologueData).length, 'zones');
            })
            .catch(err => {
                console.warn('⚠️ Échec du chargement des monologues, utilisation de données par défaut.', err);
                monologueData = {
                    "bed": [
                        "Ce lit semble confortable...",
                        "Un endroit pour se reposer.",
                        "Les rêves m'attendent ici."
                    ],
                    "bookshelf": [
                        "Des livres anciens...",
                        "La connaissance est dans ces pages.",
                        "Je me sens attiré par cette étagère."
                    ],
                    "tv": [
                        "Un vieux téléviseur...",
                        "Les images dansent sur l'écran.",
                        "Que de souvenirs."
                    ],
                    "greenboard": [
                        "Un tableau vert avec une enquête...",
                        "Des indices sont écrits ici.",
                        "Je devrais regarder de plus près."
                    ],
                    "carton": [
                        "Un carton avec une note.",
                        "Que cache ce carton ?",
                        "Il y a quelque chose d'écrit."
                    ]
                };
                console.log('📜 Utilisation des monologues par défaut.');
            });
    }
    loadMonologueData();

    const zones = [
        { id: 'bed', position: window._bedPosition || new THREE.Vector3(-7, 0, 0.8), radius: 2.5 },
        { id: 'bookshelf', position: window._bookshelfPosition || new THREE.Vector3(7.7, 0, 2), radius: 2.5 },
        { id: 'tv', position: window._tvPosition || new THREE.Vector3(-7, 0, 7.2), radius: 2.5 },
        { id: 'greenboard', position: window._greenBoardPosition || new THREE.Vector3(1, 0, 0), radius: 2.5 },
        { id: 'carton', position: window._cartonPosition || new THREE.Vector3(-5, 0.35, 7), radius: 2.0 },
        { id: 'pedestal', position: window._pedestalPosition || new THREE.Vector3(-6.88, 0, 5.29), radius: 2.0 },
    ];

    function showContextualMonologue(zoneId) {
        if (!monologueData) return;
        const texts = monologueData[zoneId];
        if (!texts || texts.length === 0) return;
        const now = performance.now();
        if (now - lastMonologueTime < monologueCooldown) return;
        lastMonologueTime = now;

        const index = Math.floor(Math.random() * texts.length);
        const text = texts[index];

        const container = document.createElement('div');
        container.id = 'contextMonologue';
        container.style.cssText = `
            position: fixed;
            bottom: 120px;
            left: 50%;
            transform: translateX(-50%);
            max-width: 80%;
            background: rgba(0, 0, 0, 0.75);
            color: #f0e8d0;
            padding: 14px 28px;
            border-radius: 12px;
            font-family: 'Georgia', serif;
            font-size: 18px;
            line-height: 1.6;
            text-align: center;
            backdrop-filter: blur(6px);
            border: 1px solid #6a5a3a;
            box-shadow: 0 4px 30px rgba(0,0,0,0.5);
            z-index: 999;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.6s ease;
        `;
        container.textContent = text;
        document.body.appendChild(container);

        requestAnimationFrame(() => {
            container.style.opacity = '1';
        });

        setTimeout(() => {
            container.style.opacity = '0';
            setTimeout(() => {
                if (container.parentNode) container.remove();
            }, 600);
        }, 4000);
    }

    function updateMonologue(cameraPos) {
        if (!monologueData) return;
        let zoneFound = null;
        for (let zone of zones) {
            const dx = cameraPos.x - zone.position.x;
            const dz = cameraPos.z - zone.position.z;
            const dist = Math.sqrt(dx*dx + dz*dz);
            if (dist < zone.radius) {
                zoneFound = zone.id;
                break;
            }
        }
        if (zoneFound && zoneFound !== currentMonologueZone) {
            currentMonologueZone = zoneFound;
            showContextualMonologue(zoneFound);
        } else if (!zoneFound) {
            currentMonologueZone = null;
        }
    }

    // ─── RETOUR ──────────────────────────────────────────────────
    const group = new THREE.Group();
    group.update = function(cameraPos, dt, time) {
        updateMonologue(cameraPos);
    };
    return group;
}